import type { APIRoute } from "astro";
import { getSecret } from "astro:env/server";

export const POST: APIRoute = async ({ request, params }) => {
  const { headers } = request;
  const { id } = params;

  const cacheNukeToken = getSecret("CACHE_NUKE_TOKEN");
  const xAuthEmail = getSecret("CLOUDFLARE_EMAIL");
  const xAuthKey = getSecret("CLOUDFLARE_API_KEY");
  const expectedHeader = `Bearer ${cacheNukeToken}`;
  const authHeader = headers.get("Authorization");

  if (authHeader !== expectedHeader) {
    return new Response(JSON.stringify({ error: true, msg: "Invalid token." }));
  }

  if (!xAuthEmail || !xAuthKey) {
    return new Response(
      JSON.stringify({ error: true, msg: "Invalid API keys." }),
    );
  }

  const result = await fetch(
    "https://api.cloudflare.com/client/v4/zones/c85e35e3765f5b50c46432221f2b3cfa/purge_cache",
    {
      method: "POST",
      headers: {
        "X-Auth-Email": xAuthEmail,
        "X-Auth-Key": xAuthKey,
      },
      body: JSON.stringify({
        files: [`https://etlstats.stiba.lol/matches/${id}`],
      }),
    },
  );

  if (!result.ok) {
    return new Response(JSON.stringify({ error: true }));
  }

  const data = await result.json();

  if (import.meta.env.DEV) {
    console.log({ data });
  }

  return new Response(JSON.stringify({ success: true }));
};
