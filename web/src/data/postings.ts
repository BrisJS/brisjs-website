/**
 * Postings data layer (feature 002, FR-02) — job postings and talk requests.
 * Both content types share the same shape (title / body / submittedDate /
 * status), so one mapper serves both. Same patterns as `talks.ts`: Strapi
 * fetch with a fixtures fallback when `STRAPI_API_URL` is unset.
 *
 * These replace the legacy GitHub-issues fetches for the Jobs and "Present"
 * (talk-requests) pages.
 */
import { format } from 'date-fns';
import {
  strapiFetch,
  useFixtures,
  type StrapiCollectionResponse,
} from '../lib/strapi.js';
import type { PostingView } from './types.js';
import jobsFixture from './__fixtures__/job-postings.json' with { type: 'json' };
import talkRequestsFixture from './__fixtures__/talk-requests.json' with { type: 'json' };

interface PostingAttributes {
  title: string;
  body?: string | null;
  submittedDate?: string | null;
  status?: string | null;
}

type PostingsResponse = StrapiCollectionResponse<PostingAttributes>;

function mapPosting(entity: { id: number; attributes: PostingAttributes }): PostingView {
  const a = entity.attributes;
  const date = a.submittedDate ? new Date(a.submittedDate) : null;
  return {
    id: entity.id,
    title: a.title,
    body: a.body?.trim() || null,
    date,
    dateHuman: date ? format(date, 'MMMM yyyy') : null,
    status: a.status?.trim() || null,
  };
}

/** Sort postings newest-first; undated entries sort last. */
function sortNewestFirst(postings: PostingView[]): PostingView[] {
  return postings.sort((a, b) => {
    const at = a.date?.getTime() ?? -Infinity;
    const bt = b.date?.getTime() ?? -Infinity;
    return bt - at;
  });
}

/** Fetch job postings, newest first. */
export async function getJobPostings(): Promise<PostingView[]> {
  const response: PostingsResponse = useFixtures()
    ? (jobsFixture as unknown as PostingsResponse)
    : await strapiFetch<PostingsResponse>('/api/job-postings');
  return sortNewestFirst(response.data.map(mapPosting));
}

/** Fetch talk requests, newest first. */
export async function getTalkRequests(): Promise<PostingView[]> {
  const response: PostingsResponse = useFixtures()
    ? (talkRequestsFixture as unknown as PostingsResponse)
    : await strapiFetch<PostingsResponse>('/api/talk-requests');
  return sortNewestFirst(response.data.map(mapPosting));
}
