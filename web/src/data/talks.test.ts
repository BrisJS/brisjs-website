/**
 * Unit tests for the talks data layer — feature 002 TC-04 (gate for T2.1).
 *
 * Proves `groupByEvent()` reproduces the legacy `getTalksByMeetup` semantics:
 * one group per meetup/event, talks collected under their group, groups ordered
 * newest-first. Also covers the ported `parseYoutube` id extraction and the
 * newest-first `getTalks()` ordering against the fixtures.
 */
import { describe, it, expect } from 'vitest';
import { getTalks, getTalkBySlug, groupByEvent, parseYoutube } from './talks.js';
import type { TalkView } from './types.js';

function talk(partial: Partial<TalkView> & Pick<TalkView, 'id' | 'date'>): TalkView {
  return {
    slug: `talk-${partial.id}`,
    legacyId: null,
    title: `Talk ${partial.id}`,
    dateHuman: '',
    synopsis: null,
    youtube: null,
    slides: null,
    code: null,
    speakers: [],
    event: null,
    ...partial,
  };
}

describe('groupByEvent (TC-04 — getTalksByMeetup parity)', () => {
  it('groups talks by their event and orders groups newest-first', () => {
    const marchEvent = { id: 10, name: 'BrisJS March 2024', date: new Date('2024-03-12T18:00:00.000Z') };
    const mayEvent = { id: 11, name: 'BrisJS May 2024', date: new Date('2024-05-14T18:00:00.000Z') };

    const talks: TalkView[] = [
      talk({ id: 3, date: mayEvent.date, event: mayEvent }),
      talk({ id: 1, date: marchEvent.date, event: marchEvent }),
      talk({ id: 2, date: marchEvent.date, event: marchEvent }),
    ];

    const groups = groupByEvent(talks);

    // Two events → two groups.
    expect(groups).toHaveLength(2);
    // Newest meetup first (May before March).
    expect(groups[0].eventName).toBe('BrisJS May 2024');
    expect(groups[1].eventName).toBe('BrisJS March 2024');
    // March group collected both of its talks.
    expect(groups[1].talks.map((t) => t.id).sort()).toEqual([1, 2]);
    expect(groups[0].talks.map((t) => t.id)).toEqual([3]);
    // Legacy className hook is reproduced.
    expect(groups[1].className).toBe('month-March year-2024');
    expect(groups[1].dateHuman).toBe('March 2024');
  });

  it('falls back to grouping by date for talks with no event (legacy key on talk.date)', () => {
    const d = new Date('2023-01-10T00:00:00.000Z');
    const talks = [talk({ id: 1, date: d }), talk({ id: 2, date: d })];
    const groups = groupByEvent(talks);
    expect(groups).toHaveLength(1);
    expect(groups[0].talks).toHaveLength(2);
    expect(groups[0].eventName).toBeNull();
  });
});

describe('parseYoutube', () => {
  it('extracts the video id and builds poster-frame URLs', () => {
    const ref = parseYoutube('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(ref?.id).toBe('dQw4w9WgXcQ');
    expect(ref?.posterFrame.large).toBe('//img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg');
  });

  it('returns null for empty input or a URL without a ?v= id', () => {
    expect(parseYoutube(null)).toBeNull();
    expect(parseYoutube('')).toBeNull();
    expect(parseYoutube('https://youtu.be/abc')).toBeNull();
  });
});

describe('getTalks / getTalkBySlug (fixtures fallback)', () => {
  it('returns fixture talks newest-first when STRAPI_API_URL is unset', async () => {
    const talks = await getTalks();
    expect(talks.length).toBeGreaterThanOrEqual(3);
    // Newest first: May 2024 talk (id 3) precedes the March talks.
    expect(talks[0].slug).toBe('typescript-at-scale');
    for (let i = 1; i < talks.length; i++) {
      expect(talks[i - 1].date.getTime()).toBeGreaterThanOrEqual(talks[i].date.getTime());
    }
  });

  it('maps relations and optional fields from the Strapi shape', async () => {
    const detail = await getTalkBySlug('reactive-patterns-in-modern-javascript');
    expect(detail).not.toBeNull();
    expect(detail!.speakers[0].name).toBe('Ada Lovelace');
    expect(detail!.speakers[0].photoUrl).toBe('/uploads/ada.jpg');
    expect(detail!.youtube?.id).toBe('dQw4w9WgXcQ');
    expect(detail!.slides).toBe('https://slides.example.com/reactive-patterns');

    const sparse = await getTalkBySlug('typescript-at-scale');
    expect(sparse!.youtube).toBeNull();
    expect(sparse!.slides).toBeNull();
    expect(sparse!.speakers).toHaveLength(0);
  });

  it('returns null for an unknown slug', async () => {
    expect(await getTalkBySlug('does-not-exist')).toBeNull();
  });
});
