/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Base URL of the Strapi instance (build-time only). */
  readonly STRAPI_API_URL?: string;
  /** Read-only Strapi API token (build-time only). */
  readonly STRAPI_API_TOKEN?: string;
  /** Force the fixtures fallback even when STRAPI_API_URL is set. */
  readonly USE_FIXTURES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
