interface ImportMetaEnv {
  readonly API_TOKEN: string;
  readonly CLOUDFLARE_API_KEY: string;
  readonly CLOUDFLARE_EMAIL: string;
  readonly CACHE_NUKE_TOKEN: string;
  readonly TEST_VARIABLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
