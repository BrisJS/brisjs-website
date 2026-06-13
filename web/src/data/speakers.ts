/**
 * Speakers data layer (feature 002, FR-02). Same patterns as `talks.ts`.
 * Speakers are primarily shown *within* talks (no standalone speakers page in
 * v1 — Open Q4 resolved), but this loader exists for completeness and reuse.
 */
import {
  populate,
  strapiFetch,
  useFixtures,
  type StrapiCollectionResponse,
} from '../lib/strapi.js';
import type { SpeakerView } from './types.js';
import speakersFixture from './__fixtures__/speakers.json' with { type: 'json' };

interface SpeakerAttributes {
  name: string;
  bio?: string | null;
  website?: string | null;
  twitter?: string | null;
  photo?: {
    data?: { attributes?: { url?: string | null } } | null;
  } | null;
}

type SpeakersResponse = StrapiCollectionResponse<SpeakerAttributes>;

function mapSpeaker(entity: { attributes: SpeakerAttributes }): SpeakerView {
  const a = entity.attributes;
  return {
    name: a.name,
    twitter: a.twitter ?? null,
    bio: a.bio ?? null,
    website: a.website ?? null,
    photoUrl: a.photo?.data?.attributes?.url ?? null,
  };
}

/** Fetch all speakers, alphabetically by name. */
export async function getSpeakers(): Promise<SpeakerView[]> {
  const response: SpeakersResponse = useFixtures()
    ? (speakersFixture as unknown as SpeakersResponse)
    : await strapiFetch<SpeakersResponse>('/api/speakers', populate(['photo']));

  return response.data
    .map(mapSpeaker)
    .sort((a, b) => a.name.localeCompare(b.name));
}
