/**
 * Single-type page content (feature 002, FR-02): HomePage intro copy,
 * Code of Conduct, and Find Us. Same patterns as `talks.ts`, but these are
 * Strapi *single types* so the REST envelope is `{ data: { id, attributes } }`
 * (one object, not a list). Fixtures fall back when `STRAPI_API_URL` is unset.
 */
import {
  strapiFetch,
  useFixtures,
  type StrapiSingleResponse,
} from '../lib/strapi.js';
import type {
  CodeOfConductView,
  FindUsView,
  HomePageView,
} from './types.js';
import homePageFixture from './__fixtures__/home-page.json' with { type: 'json' };
import codeOfConductFixture from './__fixtures__/code-of-conduct.json' with { type: 'json' };
import findUsFixture from './__fixtures__/find-us.json' with { type: 'json' };

interface HomePageAttributes {
  heroTagline?: string | null;
  intro?: string | null;
  whatWeDo?: string | null;
}
interface CodeOfConductAttributes {
  body?: string | null;
}
interface FindUsAttributes {
  venueName?: string | null;
  address?: string | null;
  mapEmbed?: string | null;
  parking?: string | null;
  accessibility?: string | null;
}

/** Fetch the HomePage single type (hero tagline + intro copy). */
export async function getHomePage(): Promise<HomePageView> {
  const response: StrapiSingleResponse<HomePageAttributes> = useFixtures()
    ? (homePageFixture as unknown as StrapiSingleResponse<HomePageAttributes>)
    : await strapiFetch<StrapiSingleResponse<HomePageAttributes>>('/api/home-page');
  const a = response.data?.attributes ?? {};
  return {
    heroTagline: a.heroTagline?.trim() || null,
    intro: a.intro?.trim() || null,
    whatWeDo: a.whatWeDo?.trim() || null,
  };
}

/** Fetch the Code of Conduct single type. */
export async function getCodeOfConduct(): Promise<CodeOfConductView> {
  const response: StrapiSingleResponse<CodeOfConductAttributes> = useFixtures()
    ? (codeOfConductFixture as unknown as StrapiSingleResponse<CodeOfConductAttributes>)
    : await strapiFetch<StrapiSingleResponse<CodeOfConductAttributes>>('/api/code-of-conduct');
  return { body: response.data?.attributes.body?.trim() || null };
}

/** Fetch the Find Us single type. */
export async function getFindUs(): Promise<FindUsView> {
  const response: StrapiSingleResponse<FindUsAttributes> = useFixtures()
    ? (findUsFixture as unknown as StrapiSingleResponse<FindUsAttributes>)
    : await strapiFetch<StrapiSingleResponse<FindUsAttributes>>('/api/find-us');
  const a = response.data?.attributes ?? {};
  return {
    venueName: a.venueName?.trim() || null,
    address: a.address?.trim() || null,
    mapEmbed: a.mapEmbed?.trim() || null,
    parking: a.parking?.trim() || null,
    accessibility: a.accessibility?.trim() || null,
  };
}
