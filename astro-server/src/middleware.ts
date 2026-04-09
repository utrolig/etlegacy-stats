import { defineMiddleware } from "astro:middleware";

const analyticsRoutes = new Map([
  ["/anal/a/script.js", "https://app.lythia.dev/collect/analytics/script.js"],
  ["/anal/m/script.js", "https://app.lythia.dev/collect/metrics/script.js"],
  ["/anal/a", "https://app.lythia.dev/collect/analytics/report"],
  ["/anal/m", "https://app.lythia.dev/collect/metrics/report"],
]);

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
]);

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.url.pathname === "/_health") {
    return new Response("OK", { status: 200 });
  }

  const target = analyticsRoutes.get(context.url.pathname);
  if (!target) return next();

  const url = new URL(target);
  url.search = context.url.search;

  const forwardHeaders = new Headers();
  for (const [key, value] of context.request.headers) {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      forwardHeaders.set(key, value);
    }
  }
  forwardHeaders.set("host", new URL(target).host);
  forwardHeaders.set("x-forwarded-proto", "https");
  forwardHeaders.set("accept-encoding", "identity");

  const hasBody = !["GET", "HEAD"].includes(context.request.method);

  return fetch(url, {
    method: context.request.method,
    headers: forwardHeaders,
    body: hasBody ? context.request.body : undefined,
    // @ts-expect-error - required for streaming request bodies in Node
    duplex: hasBody ? "half" : undefined,
  });
});
