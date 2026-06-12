/**
 * Typed Strapi REST fetch wrapper (feature 002, FR-02).
 *
 * - Reads `STRAPI_API_URL` and `STRAPI_API_TOKEN` from the environment
 *   (Astro/Vite exposes them via `import.meta.env`; Node via `process.env`).
 *   Secrets are NEVER hard-coded and are used at build time only.
 * - Fails LOUDLY: a network error or non-2xx response throws, so a broken
 *   Strapi aborts the build instead of shipping silently-empty pages
 *   (feature 002 TC-06).
 * - Falls back to local fixtures when `STRAPI_API_URL` is unset, or when
 *   `USE_FIXTURES` is truthy — see `useFixtures()`. This lets `astro build`
 *   and unit tests run without a running Strapi (feature 002 TC-04, T2.1 gate).
 */

/** Strapi REST envelope for a collection (list) response. */
export interface StrapiCollectionResponse<TAttributes> {
  data: Array<StrapiEntity<TAttributes>>;
  meta: StrapiMeta;
}

/** Strapi REST envelope for a single-type / single-entry response. */
export interface StrapiSingleResponse<TAttributes> {
  data: StrapiEntity<TAttributes> | null;
  meta: StrapiMeta;
}

export interface StrapiEntity<TAttributes> {
  id: number;
  attributes: TAttributes;
}

export interface StrapiMeta {
  pagination?: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

/**
 * A Strapi relation field as returned by the REST API.
 * To-many relations are `{ data: [...] }`; to-one are `{ data: {...} | null }`.
 */
export interface StrapiRelationMany<TAttributes> {
  data: Array<StrapiEntity<TAttributes>>;
}
export interface StrapiRelationOne<TAttributes> {
  data: StrapiEntity<TAttributes> | null;
}

type EnvBag = Record<string, string | undefined>;

/** Read an env var from import.meta.env (Vite) first, then process.env (Node). */
function env(name: string): string | undefined {
  // import.meta.env is statically replaced by Vite; guard for non-Vite runtimes.
  const viteEnv: EnvBag =
    typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env as unknown as EnvBag)
      : {};
  const nodeEnv: EnvBag =
    typeof process !== 'undefined' && process.env ? process.env : {};
  return viteEnv[name] ?? nodeEnv[name];
}

/** Base URL of the Strapi instance, with any trailing slash trimmed. */
export function strapiBaseUrl(): string | undefined {
  const url = env('STRAPI_API_URL');
  return url ? url.replace(/\/+$/, '') : undefined;
}

/**
 * Whether the data layer should use local fixtures instead of a live Strapi.
 * True when STRAPI_API_URL is unset, or USE_FIXTURES is explicitly truthy.
 */
export function useFixtures(): boolean {
  const flag = (env('USE_FIXTURES') ?? '').toLowerCase();
  if (flag === 'true' || flag === '1') return true;
  return !strapiBaseUrl();
}

/**
 * Build a Strapi `populate` query fragment.
 *
 * - `populate('*')` → `populate=*`
 * - `populate(['speakers', 'event'])` → `populate[0]=speakers&populate[1]=event`
 */
export function populate(relations: '*' | string[]): string {
  if (relations === '*') return 'populate=*';
  return relations
    .map((rel, i) => `populate[${i}]=${encodeURIComponent(rel)}`)
    .join('&');
}

/** Join a `/api/...` path with an optional query string. */
function buildUrl(base: string, path: string, query?: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return query ? `${base}${cleanPath}?${query}` : `${base}${cleanPath}`;
}

/**
 * Low-level fetch against the Strapi REST API. Throws on unreachable host or
 * non-2xx status — never returns a silently-empty result.
 *
 * @param path  e.g. `/api/talks`
 * @param query optional pre-built query string (e.g. from `populate()`)
 */
export async function strapiFetch<T>(path: string, query?: string): Promise<T> {
  const base = strapiBaseUrl();
  if (!base) {
    throw new Error(
      `strapiFetch("${path}") called but STRAPI_API_URL is not set. ` +
        `Set it, or rely on the fixtures fallback in src/data/*.`,
    );
  }

  const url = buildUrl(base, path, query);
  const token = env('STRAPI_API_TOKEN');
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(url, { headers });
  } catch (cause) {
    // Network-level failure (DNS, refused, timeout). Fail the build loudly.
    throw new Error(
      `Strapi unreachable at ${url}: ${(cause as Error).message}`,
      { cause },
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `Strapi request failed: ${res.status} ${res.statusText} for ${url}` +
        (body ? `\n${body.slice(0, 500)}` : ''),
    );
  }

  return (await res.json()) as T;
}
