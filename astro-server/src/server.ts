import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { access, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { NodeApp, loadApp } from "astro/app/node";

type CacheRouteType = "match" | "match-list";

type CacheEntry = {
  body: string;
  createdAt: number;
  expiresAt: number;
  headers: [string, string][];
  hitCount: number;
  key: string;
  lastRegeneratedAt: number;
  matchId: string | null;
  pathname: string;
  persisted: boolean;
  routeType: CacheRouteType;
  staleUntil: number;
  status: number;
  statusText: string;
};

type CacheConfig = {
  freshMs: number;
  matchId: string | null;
  routeType: CacheRouteType;
  staleMs: number;
};

type PurgePayload =
  | {
      scope: "match-list";
    }
  | {
      matchId: string;
      scope: "match";
    };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distClientDir = path.join(rootDir, "dist", "client");
const distServerDir = path.join(rootDir, "dist", "server");
const cacheDir = process.env.CACHE_DIR ?? path.join(rootDir, "cache");
const purgeToken = process.env.CACHE_PURGE_TOKEN ?? "";
const host = process.env.HOST ?? "0.0.0.0";
const port = Number(process.env.PORT ?? "4321");

const cacheTtls = {
  matchListFreshMs: getDurationMs(process.env.CACHE_LIST_TTL_SECONDS, 60_000),
  matchListStaleMs: getDurationMs(
    process.env.CACHE_LIST_STALE_TTL_SECONDS,
    600_000,
  ),
  matchFreshMs: getDurationMs(process.env.CACHE_MATCH_TTL_SECONDS, 86_400_000),
  matchStaleMs: getDurationMs(
    process.env.CACHE_MATCH_STALE_TTL_SECONDS,
    2_592_000_000,
  ),
};

const analyticsTargets = new Map<string, string>([
  ["/anal/a/script.js", "https://app.lythia.dev/collect/analytics/script.js"],
  ["/anal/m/script.js", "https://app.lythia.dev/collect/metrics/script.js"],
  ["/anal/a", "https://app.lythia.dev/collect/analytics/report"],
  ["/anal/m", "https://app.lythia.dev/collect/metrics/report"],
]);

const mimeTypes = new Map<string, string>([
  [".avif", "image/avif"],
  [".css", "text/css; charset=utf-8"],
  [".eot", "application/vnd.ms-fontobject"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".ttf", "font/ttf"],
  [".txt", "text/plain; charset=utf-8"],
  [".webm", "video/webm"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

const hopByHopHeaders = new Set<string>([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const inflightRegenerations = new Map<string, Promise<CacheEntry>>();
const astroApp = await loadAstroApp();

await mkdir(cacheDir, { recursive: true });

const server = createServer(async (req, res) => {
  try {
    await routeRequest(req, res);
  } catch (error) {
    console.error("Request handling failed", error);
    if (!res.headersSent) {
      res.writeHead(500, {
        "cache-control": "no-store",
        "content-type": "text/plain; charset=utf-8",
      });
    }
    res.end("Internal Server Error");
  }
});

if (process.env.NO_LISTEN !== "1") {
  server.listen(port, host, () => {
    console.log(`Listening on http://${host}:${port}`);
  });
}

async function routeRequest(req: IncomingMessage, res: ServerResponse) {
  const requestUrl = getRequestUrl(req);

  if (requestUrl.pathname === "/internal/cache/purge") {
    await handlePurgeRequest(req, res);
    return;
  }

  const analyticsTarget = analyticsTargets.get(requestUrl.pathname);
  if (analyticsTarget) {
    await proxyRequest(req, res, analyticsTarget, requestUrl.search);
    return;
  }

  if (await serveStaticAsset(req, res, requestUrl)) {
    return;
  }

  if (isCacheablePageRequest(req, requestUrl)) {
    await serveCachedPage(req, res, requestUrl);
    return;
  }

  const response = await renderWithAstro(req);
  await writeResponseWithHeaders(response, res, {
    "Cache-Control": "no-store",
    "X-Cache": "BYPASS",
  });
}

async function serveCachedPage(
  req: IncomingMessage,
  res: ServerResponse,
  requestUrl: URL,
) {
  const key = getCacheKey(requestUrl);
  const cacheFilePath = getCacheFilePath(key);
  const cacheConfig = getCacheConfig(requestUrl.pathname);
  const cachedEntry = await readCacheEntry(cacheFilePath);

  if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
    const updatedEntry = await recordCacheHit(cacheFilePath, cachedEntry);
    writeCachedResponse(res, updatedEntry, req.method === "HEAD", "HIT");
    return;
  }

  if (cachedEntry && cachedEntry.staleUntil > Date.now()) {
    void regenerateInBackground(key, cacheFilePath, req, requestUrl, cacheConfig);
    const updatedEntry = await recordCacheHit(cacheFilePath, cachedEntry);
    writeCachedResponse(res, updatedEntry, req.method === "HEAD", "STALE");
    return;
  }

  try {
    const freshEntry = await regenerateCacheEntry(
      key,
      cacheFilePath,
      req,
      requestUrl,
      cacheConfig,
    );
    writeCachedResponse(res, freshEntry, req.method === "HEAD", "MISS");
  } catch (error) {
    if (cachedEntry) {
      console.error("Serving stale cache after regeneration failure", error);
      const updatedEntry = await recordCacheHit(cacheFilePath, cachedEntry);
      writeCachedResponse(res, updatedEntry, req.method === "HEAD", "STALE");
      return;
    }

    throw error;
  }
}

async function regenerateInBackground(
  key: string,
  cacheFilePath: string,
  req: IncomingMessage,
  requestUrl: URL,
  cacheConfig: CacheConfig,
) {
  if (inflightRegenerations.has(key)) {
    return;
  }

  try {
    await regenerateCacheEntry(key, cacheFilePath, req, requestUrl, cacheConfig);
  } catch (error) {
    console.error(`Background regeneration failed for ${requestUrl.pathname}`, error);
  }
}

async function regenerateCacheEntry(
  key: string,
  cacheFilePath: string,
  req: IncomingMessage,
  requestUrl: URL,
  cacheConfig: CacheConfig,
) {
  const existing = inflightRegenerations.get(key);
  if (existing) {
    return existing;
  }

  const promise = (async () => {
    const response = await renderWithAstro(req);
    const body = await response.text();

    if (!shouldCacheResponse(response)) {
      return responseToCacheEntry(response, body, requestUrl, cacheConfig, false);
    }

    const entry = responseToCacheEntry(response, body, requestUrl, cacheConfig, true);
    await writeFile(cacheFilePath, JSON.stringify(entry), "utf-8");
    return entry;
  })();

  inflightRegenerations.set(key, promise);

  try {
    return await promise;
  } finally {
    inflightRegenerations.delete(key);
  }
}

async function renderWithAstro(req: IncomingMessage) {
  const request = NodeApp.createRequest(req);
  const routeData = astroApp.match(request);
  return astroApp.render(request, {
    addCookieHeader: true,
    routeData,
  });
}

function shouldCacheResponse(response: Response) {
  if (response.status !== 200) {
    return false;
  }

  if (response.headers.has("set-cookie")) {
    return false;
  }

  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("text/html");
}

function responseToCacheEntry(
  response: Response,
  body: string,
  requestUrl: URL,
  cacheConfig: CacheConfig,
  persisted: boolean,
): CacheEntry {
  const now = Date.now();
  const headers: [string, string][] = [];

  for (const [name, value] of response.headers.entries()) {
    const lowerName = name.toLowerCase();
    if (hopByHopHeaders.has(lowerName) || lowerName === "content-length") {
      continue;
    }
    headers.push([name, value]);
  }

  return {
    body,
    createdAt: now,
    expiresAt: now + cacheConfig.freshMs,
    headers,
    hitCount: 0,
    key: getCacheKey(requestUrl),
    lastRegeneratedAt: now,
    matchId: cacheConfig.matchId,
    pathname: requestUrl.pathname,
    persisted,
    routeType: cacheConfig.routeType,
    staleUntil: now + cacheConfig.freshMs + cacheConfig.staleMs,
    status: response.status,
    statusText: response.statusText,
  };
}

function writeCachedResponse(
  res: ServerResponse,
  entry: CacheEntry,
  headOnly: boolean,
  cacheStatus: "HIT" | "MISS" | "STALE",
) {
  const headers = Object.fromEntries(entry.headers);
  headers["Cache-Control"] = "no-store";
  headers["Content-Length"] = String(Buffer.byteLength(entry.body));
  headers["X-Cache"] = cacheStatus;
  headers["X-Cache-Hits"] = String(entry.hitCount);
  headers["X-Cache-Last-Regenerated"] = new Date(
    entry.lastRegeneratedAt,
  ).toISOString();

  res.writeHead(entry.status, entry.statusText, headers);
  if (headOnly) {
    res.end();
    return;
  }
  res.end(entry.body);
}

async function handlePurgeRequest(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") {
    res.writeHead(405, {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
    });
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  if (!purgeToken || req.headers["x-cache-purge-token"] !== purgeToken) {
    res.writeHead(401, {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
    });
    res.end(JSON.stringify({ error: "Unauthorized" }));
    return;
  }

  const body = await readJsonBody(req);
  const deleted = await purgeCache(body);

  res.writeHead(200, {
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify({ deleted }));
}

async function purgeCache(body: PurgePayload | null) {
  const files = await readdir(cacheDir);
  const matchingFiles: string[] = [];

  for (const file of files) {
    if (!file.endsWith(".json")) {
      continue;
    }

    const filePath = path.join(cacheDir, file);
    const entry = await readCacheEntry(filePath);

    if (!entry?.persisted) {
      continue;
    }

    if (body?.scope === "match-list" && entry.routeType === "match-list") {
      matchingFiles.push(filePath);
      continue;
    }

    if (
      body?.scope === "match" &&
      entry.routeType === "match" &&
      entry.matchId === body.matchId
    ) {
      matchingFiles.push(filePath);
    }
  }

  await Promise.all(matchingFiles.map((filePath) => rm(filePath, { force: true })));
  return matchingFiles.length;
}

async function proxyRequest(
  req: IncomingMessage,
  res: ServerResponse,
  target: string,
  search: string,
) {
  const url = new URL(target);
  url.search = search;

  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (value === undefined || hopByHopHeaders.has(name.toLowerCase())) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else {
      headers.set(name, value);
    }
  }

  headers.set("host", url.host);
  headers.set("x-forwarded-proto", "https");

  const requestInit: RequestInit & { duplex?: "half" } = {
    headers,
    method: req.method,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    requestInit.body = req as unknown as RequestInit["body"];
    requestInit.duplex = "half";
  }

  const response = await fetch(url, requestInit);

  await writeResponseWithHeaders(response, res, {
    "X-Cache": "BYPASS",
  });
}

async function serveStaticAsset(
  req: IncomingMessage,
  res: ServerResponse,
  requestUrl: URL,
) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return false;
  }

  const pathname = decodeURIComponent(requestUrl.pathname);
  const relativePath = pathname === "/" ? "" : pathname.slice(1);
  const assetPath = path.resolve(distClientDir, relativePath);

  if (!assetPath.startsWith(distClientDir)) {
    return false;
  }

  let assetStats;
  try {
    assetStats = await stat(assetPath);
    if (!assetStats.isFile()) {
      return false;
    }
  } catch {
    return false;
  }

  const extension = path.extname(assetPath).toLowerCase();
  res.writeHead(200, {
    "Cache-Control": pathname.startsWith("/_astro/")
      ? "public, max-age=31536000, immutable"
      : "public, max-age=3600",
    "Content-Length": String(assetStats.size),
    "Content-Type": mimeTypes.get(extension) ?? "application/octet-stream",
    "X-Cache": "BYPASS",
  });

  if (req.method === "HEAD") {
    res.end();
    return true;
  }

  createReadStream(assetPath).pipe(res);
  return true;
}

async function readCacheEntry(filePath: string) {
  try {
    const raw = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<CacheEntry>;
    return {
      ...parsed,
      hitCount: parsed.hitCount ?? 0,
      lastRegeneratedAt: parsed.lastRegeneratedAt ?? parsed.createdAt ?? Date.now(),
    } as CacheEntry;
  } catch {
    return null;
  }
}

async function recordCacheHit(filePath: string, entry: CacheEntry) {
  const updatedEntry: CacheEntry = {
    ...entry,
    hitCount: entry.hitCount + 1,
  };

  if (entry.persisted) {
    await writeFile(filePath, JSON.stringify(updatedEntry), "utf-8");
  }

  return updatedEntry;
}

async function readJsonBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return null;
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf-8")) as PurgePayload;
}

function getCacheFilePath(key: string) {
  return path.join(cacheDir, `${createHash("sha256").update(key).digest("hex")}.json`);
}

function getCacheKey(requestUrl: URL) {
  return `${normalizePathname(requestUrl.pathname)}${normalizeSearchParams(requestUrl.searchParams)}`;
}

function getCacheConfig(pathname: string): CacheConfig {
  if (pathname === "/") {
    return {
      freshMs: cacheTtls.matchListFreshMs,
      matchId: null,
      routeType: "match-list",
      staleMs: cacheTtls.matchListStaleMs,
    };
  }

  const match = pathname.match(/^\/matches\/([^/]+)\/?$/);
  if (!match) {
    throw new Error(`Unsupported cacheable route: ${pathname}`);
  }

  return {
    freshMs: cacheTtls.matchFreshMs,
    matchId: match[1],
    routeType: "match",
    staleMs: cacheTtls.matchStaleMs,
  };
}

function isCacheablePageRequest(req: IncomingMessage, requestUrl: URL) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return false;
  }

  const pathname = normalizePathname(requestUrl.pathname);
  return pathname === "/" || /^\/matches\/[^/]+$/.test(pathname);
}

function getRequestUrl(req: IncomingMessage) {
  const hostHeader = req.headers.host ?? `127.0.0.1:${port}`;
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol = Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : forwardedProto ?? "http";

  return new URL(req.url ?? "/", `${protocol}://${hostHeader}`);
}

function normalizePathname(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function normalizeSearchParams(searchParams: URLSearchParams) {
  const params = new URLSearchParams(searchParams);
  params.sort();
  const normalized = params.toString();
  return normalized ? `?${normalized}` : "";
}

function getDurationMs(rawValue: string | undefined, defaultValue: number) {
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return defaultValue;
  }
  return parsed * 1000;
}

async function loadAstroApp() {
  await access(path.join(distServerDir, "entry.mjs"));

  const manifestModulePath = await findServerFile(/^manifest_.*\.mjs$/);
  if (!manifestModulePath) {
    return loadApp(pathToFileURL(`${distServerDir}/`));
  }

  const actionsModulePath =
    (await findServerFile(/(^|_)actions.*\.mjs$/)) ??
    path.join(distServerDir, "_noop-actions.mjs");
  const middlewareModulePath =
    (await findServerFile(/(^|_)middleware.*\.mjs$/)) ??
    path.join(distServerDir, "_noop-middleware.mjs");
  const renderersModulePath = path.join(distServerDir, "renderers.mjs");
  const entryModulePath = path.join(distServerDir, "entry.mjs");

  const [{ manifest }, { renderers }, entryModule] = await Promise.all([
    import(pathToFileURL(manifestModulePath).href),
    import(pathToFileURL(renderersModulePath).href),
    import(pathToFileURL(entryModulePath).href),
  ]);

  const appManifest = Object.assign(manifest, {
    actions: () => import(pathToFileURL(actionsModulePath).href),
    middleware: () => import(pathToFileURL(middlewareModulePath).href),
    pageMap: entryModule.pageMap as Map<string, unknown>,
    renderers,
    serverIslandMap: new Map(),
  });

  return new NodeApp(appManifest);
}

async function findServerFile(pattern: RegExp) {
  const entries = await readdir(distServerDir);
  const match = entries.find((entry) => pattern.test(entry));
  return match ? path.join(distServerDir, match) : null;
}

async function writeResponseWithHeaders(
  response: Response,
  res: ServerResponse,
  extraHeaders: Record<string, string>,
) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(extraHeaders)) {
    headers.set(name, value);
  }

  const clonedResponse = new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });

  await NodeApp.writeResponse(clonedResponse, res);
}
