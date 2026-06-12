/**
 * Hand-written narrow view-model types the Astro pages consume (feature 002,
 * Open Q1 resolved: TypeScript with hand-written view models in `src/data`,
 * not generated). These are mapped from the Strapi REST shape by the loaders
 * in this directory; the Strapi content-type definitions (feature 001) remain
 * the source of truth.
 */

/** A YouTube reference derived from a watch URL (port of `parseYoutube`). */
export interface YoutubeRef {
  id: string;
  url: string;
  posterFrame: {
    small: string;
    medium: string;
    large: string;
  };
}

/** A speaker as shown on a talk card / detail page. */
export interface SpeakerView {
  name: string;
  /** Twitter handle (without `@`), if known. The Twitter API is deprecated. */
  twitter: string | null;
  bio: string | null;
  website: string | null;
  photoUrl: string | null;
}

/** A single talk view model. */
export interface TalkView {
  /** Strapi numeric id. */
  id: number;
  /** Route key — UID slug from the title (feature 001 `Talk.slug`). */
  slug: string;
  /** Legacy sheet id, for `#talk-<id>` redirects (feature 001 `Talk.legacyId`). */
  legacyId: number | null;
  title: string;
  /** Talk date (falls back to the parent event's dateTime). */
  date: Date;
  /** e.g. "March 2024" — port of the legacy `dateHuman`. */
  dateHuman: string;
  synopsis: string | null;
  youtube: YoutubeRef | null;
  slides: string | null;
  code: string | null;
  speakers: SpeakerView[];
  /** The event this talk was given at, if linked. */
  event: EventRef | null;
}

/** Minimal reference to the event a talk belongs to. */
export interface EventRef {
  id: number;
  name: string;
  date: Date;
}

/** A group of talks given at the same meetup/event (port of `getTalksByMeetup`). */
export interface EventGroup {
  /** Stable group key — the event id when known, else the date key. */
  key: string;
  /** Group date (the event/meetup date) used for ordering. */
  date: Date;
  /** Human label, e.g. "March 2024". */
  dateHuman: string;
  /** Event name when the talk is linked to an event, else null. */
  eventName: string | null;
  /** Legacy CSS hook (port of `getTalksByMeetup` `className`). */
  className: string;
  talks: TalkView[];
}
