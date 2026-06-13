/**
 * Legacy URL redirect resolution (feature 004, FR-04).
 *
 * The old site was a single-page app at the root using `#hash` routes
 * (e.g. `https://brisjs.org/#talks`, `#talk-167`). Hash fragments are never
 * sent to the server, so these can't be handled by Netlify `[[redirects]]` —
 * they need a tiny client-side shim that runs on the landing page, reads
 * `location.hash`, and forwards to the new real Astro route.
 *
 * This module holds the PURE mapping logic so it can be unit-tested
 * (feature 004 TC-04) independently of the DOM. The Astro component
 * `LegacyHashRedirect.astro` wires it to `window`.
 */

/** Static legacy hash → new path. Keys are the hash WITHOUT the leading `#`. */
export const LEGACY_HASH_ROUTES: Record<string, string> = {
  '': '/',
  home: '/',
  talks: '/talks',
  present: '/talk-requests',
  jobs: '/jobs',
  contact: '/contact',
  findus: '/find-us',
  conduct: '/code-of-conduct',
};

/**
 * Resolve a legacy hash to the new path, or `null` if it isn't a legacy route
 * we recognise (in which case the shim should do nothing — no redirect loop).
 *
 * @param hash               `location.hash`, with or without the leading `#`.
 * @param legacyIdToSlug     map of legacy talk id → new slug, generated at build.
 */
export function resolveLegacyHash(
  hash: string,
  legacyIdToSlug: Record<string, string>,
): string | null {
  const key = hash.replace(/^#/, '').trim();
  if (key === '') return null; // bare root, nothing to do

  // #talk-<id> → /talks/<slug>, or /talks as a graceful fallback (TC-04).
  const talkMatch = key.match(/^talk-(\d+)$/);
  if (talkMatch) {
    const slug = legacyIdToSlug[talkMatch[1]];
    return slug ? `/talks/${slug}` : '/talks';
  }

  if (Object.prototype.hasOwnProperty.call(LEGACY_HASH_ROUTES, key)) {
    return LEGACY_HASH_ROUTES[key];
  }

  return null;
}
