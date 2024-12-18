import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const { headers } = request;

  const expectedHeader = `Bearer ${import.meta.env.CACHE_NUKE_TOKEN}`;
  const authHeader = headers.get("Authorization");
  console.log(`Expected: ${expectedHeader} --- Got: ${authHeader}`);

  if (authHeader !== expectedHeader) {
    return new Response(JSON.stringify({ error: true, msg: "Invalid token." }));
  }

  const result = await fetch(
    "https://api.cloudflare.com/client/v4/zones/c85e35e3765f5b50c46432221f2b3cfa/purge_cache",
    {
      method: "POST",
      headers: {
        "X-Auth-Email": import.meta.env.CLOUDFLARE_EMAIL,
        "X-Auth-Key": import.meta.env.CLOUDFLARE_API_KEY,
      },
      body: JSON.stringify({ files: ["https://etlstats.stiba.lol"] }),
    },
  );

  if (!result.ok) {
    if (import.meta.env.DEV) {
      console.error(result);
      console.error(await result.json());
    }
    return new Response(JSON.stringify({ error: true }));
  }

  const data = await result.json();

  if (import.meta.env.DEV) {
    console.log({ data });
  }

  return new Response(JSON.stringify({ success: true }));
};
