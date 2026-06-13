/**
 * Events data layer (feature 002, FR-02). Same patterns as `talks.ts`:
 * fetch via `src/lib/strapi.ts`, or fall back to local fixtures when
 * `STRAPI_API_URL` is unset (see `useFixtures()`).
 *
 * The home page shows a single *upcoming* event (Open Q2 resolved:
 * Strapi-managed events only — the next future event, with a meetup.com
 * fallback when there is none).
 */
import { format } from 'date-fns';
import {
  populate,
  strapiFetch,
  useFixtures,
  type StrapiCollectionResponse,
} from '../lib/strapi.js';
import type { EventView } from './types.js';
import eventsFixture from './__fixtures__/events.json' with { type: 'json' };

interface EventAttributes {
  name: string;
  dateTime: string;
  venue?: string | null;
  description?: string | null;
}

type EventsResponse = StrapiCollectionResponse<EventAttributes>;

/** Long human date, e.g. "Monday, 3 March 2024". */
export function formatEventDate(date: Date): string {
  return format(date, 'EEEE, d MMMM yyyy');
}

function mapEvent(entity: { id: number; attributes: EventAttributes }): EventView {
  const a = entity.attributes;
  const date = new Date(a.dateTime);
  return {
    id: entity.id,
    name: a.name,
    date,
    dateHuman: formatEventDate(date),
    venue: a.venue?.trim() || null,
    description: a.description?.trim() || null,
  };
}

/** Fetch all events, newest first. */
export async function getEvents(): Promise<EventView[]> {
  const response: EventsResponse = useFixtures()
    ? (eventsFixture as unknown as EventsResponse)
    : await strapiFetch<EventsResponse>('/api/events', populate(['talks']));

  const events = response.data.map(mapEvent);
  events.sort((a, b) => b.date.getTime() - a.date.getTime());
  return events;
}

/**
 * The next upcoming event — the soonest event whose date is in the future,
 * or null when none is scheduled (the home page then shows a "TBA" fallback
 * with a meetup.com link). "Now" defaults to the build time.
 */
export async function getUpcomingEvent(now: Date = new Date()): Promise<EventView | null> {
  const events = await getEvents();
  const upcoming = events
    .filter((e) => e.date.getTime() >= now.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  return upcoming[0] ?? null;
}
