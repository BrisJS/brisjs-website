/**
 * Organizers data layer (feature 002, FR-02) — the contact page. Same patterns
 * as `talks.ts`. Replaces the legacy `data/contact.json`.
 */
import {
  populate,
  strapiFetch,
  useFixtures,
  type StrapiCollectionResponse,
} from '../lib/strapi.js';
import type { OrganizerView } from './types.js';
import organizersFixture from './__fixtures__/organizers.json' with { type: 'json' };

interface OrganizerAttributes {
  name: string;
  role?: string | null;
  bio?: string | null;
  twitter?: string | null;
  email?: string | null;
  order?: number | null;
  photo?: {
    data?: { attributes?: { url?: string | null } } | null;
  } | null;
}

type OrganizersResponse = StrapiCollectionResponse<OrganizerAttributes>;

function mapOrganizer(entity: { id: number; attributes: OrganizerAttributes }): OrganizerView {
  const a = entity.attributes;
  return {
    id: entity.id,
    name: a.name,
    role: a.role?.trim() || null,
    bio: a.bio?.trim() || null,
    photoUrl: a.photo?.data?.attributes?.url ?? null,
    twitter: a.twitter?.trim() || null,
    email: a.email?.trim() || null,
    order: a.order ?? 0,
  };
}

/** Fetch organizers in display order (ascending `order`, then name). */
export async function getOrganizers(): Promise<OrganizerView[]> {
  const response: OrganizersResponse = useFixtures()
    ? (organizersFixture as unknown as OrganizersResponse)
    : await strapiFetch<OrganizersResponse>('/api/organizers', populate(['photo']));

  return response.data
    .map(mapOrganizer)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}
