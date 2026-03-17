interface ImportMetaEnv {
  readonly API_TOKEN: string;
  readonly TEST_VARIABLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
