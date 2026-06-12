/**
 * Talks data layer (feature 002, FR-02). Ports the grouping/parsing semantics
 * of the legacy `lib/tsvTalks.js`:
 *   - `parseYoutube`        → `parseYoutube()` here (id extraction + poster frames)
 *   - `getTalksByMeetup`    → `groupByEvent()` here (one group per meetup, newest-first)
 *   - newest-first ordering → `getTalks()` sorts descending by date
 *
 * Reads from Strapi via `src/lib/strapi.ts`, or from local fixtures when
 * `STRAPI_API_URL` is unset (see `useFixtures()`), so the build and the unit
 * tests run without a live Strapi.
 */
import { format } from 'date-fns';
import {
  populate,
  strapiFetch,
  useFixtures,
  type StrapiCollectionResponse,
  type StrapiRelationMany,
  type StrapiRelationOne,
} from '../lib/strapi.js';
import type {
  EventGroup,
  EventRef,
  SpeakerView,
  TalkView,
  YoutubeRef,
} from './types.js';
import talksFixture from './__fixtures__/talks.json' with { type: 'json' };

// --- Strapi attribute shapes (feature 001 model) -------------------------------

interface SpeakerAttributes {
  name: string;
  bio?: string | null;
  website?: string | null;
  twitter?: string | null;
  photo?: {
    data?: { attributes?: { url?: string | null } } | null;
  } | null;
}

interface EventAttributes {
  name: string;
  dateTime: string;
  venue?: string | null;
  description?: string | null;
}

interface TalkAttributes {
  title: string;
  slug: string;
  legacyId?: number | null;
  date: string;
  synopsis?: string | null;
  youtubeUrl?: string | null;
  slidesUrl?: string | null;
  codeUrl?: string | null;
  speakers?: StrapiRelationMany<SpeakerAttributes>;
  event?: StrapiRelationOne<EventAttributes>;
}

type TalksResponse = StrapiCollectionResponse<TalkAttributes>;

// --- Pure parsing helpers (ported from lib/tsvTalks.js) ------------------------

/** Human-readable month label, e.g. "March 2024" (port of legacy `dateHuman`). */
export function formatDateHuman(date: Date): string {
  // Legacy used date-fns v1 token "MMMM YYYY"; v2+ spells the year "yyyy".
  return format(date, 'MMMM yyyy');
}

/** YouTube poster-frame URLs (port of `parseYoutubePosterFrame`). */
function youtubePosterFrame(id: string): YoutubeRef['posterFrame'] {
  return {
    small: `//img.youtube.com/vi/${id}/default.jpg`,
    medium: `//img.youtube.com/vi/${id}/mqdefault.jpg`,
    large: `//img.youtube.com/vi/${id}/maxresdefault.jpg`,
  };
}

/**
 * Extract a YouTube video id from a watch URL (port of `parseYoutube`).
 * Returns null for empty input or a URL without a `?v=` id.
 */
export function parseYoutube(youtubeUrl?: string | null): YoutubeRef | null {
  if (!youtubeUrl) return null;
  const match = youtubeUrl.match(/[?&]v=([A-Za-z0-9_-]+)/);
  if (!match || !match[1]) return null;
  return {
    id: match[1],
    url: youtubeUrl,
    posterFrame: youtubePosterFrame(match[1]),
  };
}

// --- Strapi → view-model mapping ----------------------------------------------

function mapSpeaker(name: string): SpeakerView;
function mapSpeaker(entity: {
  attributes: SpeakerAttributes;
}): SpeakerView;
function mapSpeaker(
  input: string | { attributes: SpeakerAttributes },
): SpeakerView {
  if (typeof input === 'string') {
    return { name: input, twitter: null, bio: null, website: null, photoUrl: null };
  }
  const a = input.attributes;
  return {
    name: a.name,
    twitter: a.twitter ?? null,
    bio: a.bio ?? null,
    website: a.website ?? null,
    photoUrl: a.photo?.data?.attributes?.url ?? null,
  };
}

function mapEventRef(
  rel: StrapiRelationOne<EventAttributes> | undefined,
): EventRef | null {
  const data = rel?.data;
  if (!data) return null;
  return {
    id: data.id,
    name: data.attributes.name,
    date: new Date(data.attributes.dateTime),
  };
}

function mapTalk(entity: {
  id: number;
  attributes: TalkAttributes;
}): TalkView {
  const a = entity.attributes;
  const eventRef = mapEventRef(a.event);
  // Prefer the talk's own date; fall back to the parent event's date.
  const date = a.date ? new Date(a.date) : (eventRef?.date ?? new Date(0));
  const speakers = (a.speakers?.data ?? []).map((s) => mapSpeaker(s));
  return {
    id: entity.id,
    slug: a.slug,
    legacyId: a.legacyId ?? null,
    title: a.title,
    date,
    dateHuman: formatDateHuman(date),
    synopsis: a.synopsis ?? null,
    youtube: parseYoutube(a.youtubeUrl),
    slides: a.slidesUrl?.trim() || null,
    code: a.codeUrl?.trim() || null,
    speakers,
    event: eventRef,
  };
}

// --- Public data API ----------------------------------------------------------

/** Fetch all talks (with speakers + event populated), newest first. */
export async function getTalks(): Promise<TalkView[]> {
  const response: TalksResponse = useFixtures()
    ? (talksFixture as unknown as TalksResponse)
    : await strapiFetch<TalksResponse>(
        '/api/talks',
        populate(['speakers', 'speakers.photo', 'event']),
      );

  const talks = response.data.map(mapTalk);
  // Newest-first ordering (legacy displayed talks descending by date).
  talks.sort((a, b) => b.date.getTime() - a.date.getTime());
  return talks;
}

/** Fetch a single talk by its slug, or null if not found. */
export async function getTalkBySlug(slug: string): Promise<TalkView | null> {
  const talks = await getTalks();
  return talks.find((t) => t.slug === slug) ?? null;
}

/**
 * Group talks by the meetup/event they were given at, newest group first
 * (port of `getTalksByMeetup`). Talks linked to a Strapi Event are grouped by
 * event id; talks with no event fall back to grouping by their date key,
 * matching the legacy behaviour of keying on `talk.date`.
 */
export function groupByEvent(talks: TalkView[]): EventGroup[] {
  const groups = new Map<string, EventGroup>();

  for (const talk of talks) {
    const key = talk.event
      ? `event-${talk.event.id}`
      : `date-${talk.date.getTime()}`;
    const groupDate = talk.event ? talk.event.date : talk.date;

    let group = groups.get(key);
    if (!group) {
      group = {
        key,
        date: groupDate,
        dateHuman: formatDateHuman(groupDate),
        eventName: talk.event?.name ?? null,
        className: `month-${format(groupDate, 'MMMM')} year-${format(groupDate, 'yyyy')}`,
        talks: [],
      };
      groups.set(key, group);
    }
    group.talks.push(talk);
  }

  // Newest meetup first.
  return [...groups.values()].sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );
}
