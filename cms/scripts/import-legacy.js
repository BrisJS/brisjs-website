'use strict';

/**
 * Idempotent legacy importer for the BrisJS Strapi CMS (task T1.2).
 *
 * Seeds the LOCAL Strapi DB from the legacy data sources, mirroring the
 * Migration Mapping in features/001-strapi-content-modeling/DESIGN.md:
 *
 *   - Talks       <- data/legacy/talks.tsv   (parsing mirrors lib/tsvTalks.js)
 *   - Speakers    <- talks.tsv CSV columns, enriched from data/twitter.json
 *   - Events      <- one Event per unique talk date (a monthly meetup)
 *   - Organizers  <- data/contact.json
 *   - HomePage / CodeOfConduct / FindUs <- copy extracted from index.html
 *
 * Idempotency: every entry is upserted by a stable natural key
 *   - Talk      by legacyId
 *   - Speaker   by name
 *   - Event     by date (YYYY-MM-DD)
 *   - Organizer by name
 *   - single types are a single row each (find-or-create)
 * so a second run creates NO duplicates.
 *
 * Usage (must run under Node 20-24, e.g. `nvm use 22`):
 *   node scripts/import-legacy.js            # write + publish
 *   node scripts/import-legacy.js --dry-run  # report only, no writes
 *
 * The script bootstraps a full Strapi instance so it can use the document
 * service (strapi.documents(...)) rather than raw SQL.
 */

const path = require('path');
const fs = require('fs');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.join(REPO_ROOT, 'data');
const TSV_PATH = path.join(DATA_DIR, 'legacy', 'talks.tsv');
const TWITTER_PATH = path.join(DATA_DIR, 'twitter.json');
const CONTACT_PATH = path.join(DATA_DIR, 'contact.json');

const DRY_RUN = process.argv.includes('--dry-run');

// ---------------------------------------------------------------------------
// Legacy parsing helpers (mirror lib/tsvTalks.js semantics)
// ---------------------------------------------------------------------------

function parseGroup(group) {
  return (group || '').split(',').map((s) => s.trim());
}

/**
 * Split the speakers + twitters CSV columns into aligned {name, twitterUser}
 * pairs, mirroring parseSpeakers() in lib/tsvTalks.js.
 */
function parseSpeakers(speakers, twitters) {
  const names = parseGroup(speakers || 'Unknown Speaker');
  const handles = parseGroup(twitters || '');
  return names
    .map((name, i) => ({
      name: name && name.trim(),
      twitterUser: handles[i] ? handles[i].trim() : null,
    }))
    .filter((s) => s.name); // drop empty names
}

/** Extract the YouTube watch URL only when it parses to a video id. */
function normaliseYoutube(youtubeUrl) {
  if (!youtubeUrl) return null;
  const trimmed = youtubeUrl.trim();
  if (!trimmed) return null;
  const m = trimmed.match(/\?v=([A-Za-z0-9_-]+)/);
  if (!m || !m[1]) return null;
  return trimmed;
}

function emptyToNull(v) {
  if (v === undefined || v === null) return null;
  const t = String(v).trim();
  return t === '' ? null : t;
}

/**
 * Stable small positive hash for synthesising a legacyId when the legacy row
 * has no id (a few rows in talks.tsv are missing the id column). Offset above
 * the real max id (231) so it can never collide with a real legacyId.
 */
function synthLegacyId(title, epoch) {
  let h = 0;
  const s = `${title}|${epoch}`;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return 900000 + (h % 90000); // deterministic, well above real ids
}

/** Parse the TSV into talk rows. Mirrors parseTsv() column order. */
function parseTsv(tsv) {
  const parsed = tsv
    .split('\n')
    .slice(1) // drop header
    .map((line) => line.replace(/\r$/, ''))
    .filter((line) => line.trim() !== '')
    .map((line) => line.split('\t'))
    .map((row) => {
      const epoch = Number(row[1]);
      const date = new Date(epoch);
      const title = (row[2] || '').trim();
      const rawSpeakers = (row[3] || '').trim();
      const rawId = (row[0] || '').trim();
      const legacyId =
        rawId !== '' && !Number.isNaN(Number(rawId))
          ? Number(rawId)
          : synthLegacyId(title, epoch);
      return {
        legacyId,
        epoch,
        date, // JS Date
        title,
        hasRealSpeakers: rawSpeakers !== '',
        speakers: parseSpeakers(row[3], row[4]),
        youtubeUrl: normaliseYoutube(row[5]),
        slidesUrl: emptyToNull(row[6]),
        codeUrl: emptyToNull(row[7]),
        synopsis: emptyToNull(row[8]),
      };
    })
    // Drop fully-empty rows (no title AND no real speakers) — e.g. the stray
    // trailing row in talks.tsv that carries only a date.
    .filter((t) => t.title !== '' || t.hasRealSpeakers);

  // The legacy sheet reuses a handful of ids across DIFFERENT talks (ids 189,
  // 206, 207, 208 each appear twice on different dates). legacyId is unique in
  // the schema, so collapsing them would silently drop real talks. Keep the
  // FIRST occurrence's original id (so its #talk-<id> redirect still resolves)
  // and give later collisions a deterministic synthetic id.
  const seenIds = new Set();
  for (const t of parsed) {
    if (seenIds.has(t.legacyId)) {
      t.legacyId = synthLegacyId(t.title, t.epoch);
    }
    seenIds.add(t.legacyId);
  }
  return parsed;
}

/** epoch-ms -> "YYYY-MM-DD" (UTC) for the Talk.date (date) field. */
function toDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

/** epoch-ms -> ISO datetime for Event.dateTime (datetime). */
function toDateTime(date) {
  return date.toISOString();
}

/**
 * Slugify a title for the Talk.slug (uid) field. Strapi auto-generates uids in
 * the admin content-manager, but the core document service does not, so we
 * derive a deterministic slug here. legacyId is appended to guarantee
 * uniqueness across talks that share a title (e.g. repeated workshop parts).
 */
function slugify(title, legacyId) {
  const base = String(title || 'talk')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'talk';
  return `${base}-${legacyId}`;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Human event name from a date, e.g. "BrisJS — March 2024". */
function eventName(date) {
  return `BrisJS — ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

// ---------------------------------------------------------------------------
// index.html static-copy extraction (best-effort, flagged where unreliable)
// ---------------------------------------------------------------------------

/**
 * The home intro / code-of-conduct / find-us copy is hard-coded markup in
 * index.html. Rather than HTML-parse fragile selectors at runtime, we hold
 * the extracted copy here as plain text (transcribed from index.html on
 * 2026-06-13). This is deterministic and re-runnable. Anything that needs
 * richer treatment is flagged in the report.
 */
const STATIC_COPY = {
  homePage: {
    // index.html lines 61-64
    heroTagline:
      "Brisbane's JavaScript community — monthly talks on the first Monday.",
    intro:
      "We're the Brisbane JavaScript programming group - BrisJS for short. " +
      "Our mission is to provide a community and a voice for Brisbane's " +
      'JavaScript technology community.',
    whatWeDo:
      'We present technical talks on the first Monday of every month, and ' +
      'have periodic networking events between.',
  },
  // index.html lines 304-355 (conduct page). Transcribed as Markdown so the
  // richtext field keeps its structure.
  codeOfConduct: {
    body: [
      'BrisJS is committed to making our talks, pub meets, and other events a safe and enjoyable place for everyone.',
      '',
      '## Code of Conduct',
      '',
      'The BrisJS community has proven to be a very welcoming and open group. By joining that group as an attendee, speaker, or sponsor, you will be held to that same high standard.',
      '',
      'BrisJS is dedicated to providing a harassment-free experience for everyone.',
      '',
      'Harassment includes, but is not limited to:',
      '',
      '1. Verbal comments that reinforce social structures of domination related to gender, gender identity and expression, sexual orientation, disability, physical appearance, body size, race, age, religion (or lack thereof)',
      '2. Sexual images in public spaces',
      '3. Deliberate intimidation, stalking, or following',
      '4. Harassing photography or recording',
      '5. Sustained disruption of talks or other events',
      '6. Inappropriate physical contact',
      '7. Unwelcome sexual attention',
      '8. Advocating for, or encouraging, any of the above behaviour',
      '',
      'Participants asked to stop any harassing behaviour are expected to comply immediately.',
      '',
      'Sponsors are also subject to the anti-harassment policy. In particular, sponsors should not use sexualised images, activities, or other material. Booth staff (including volunteers) should not use sexualised clothing/uniforms/costumes, or otherwise create a sexualised environment.',
      '',
      'We expect participants to follow these rules at conference and workshop venues, conference-related social events and online spaces.',
      '',
      '## If you are being harassed',
      '',
      'If you are being harassed, notice that someone else is being harassed, or have any other concerns, please get in touch with us. You can make a report either personally or anonymously.',
      '',
      '### Anonymous report',
      '',
      'You can use our [anonymous report form](https://goo.gl/forms/uZsjKme75V8PBcQZ2). We can\'t follow up an anonymous report with you directly, but we will fully investigate it and take whatever action is necessary to prevent a recurrence.',
      '',
      '### Personal report',
      '',
      'When taking a personal report, we will ensure you are safe and cannot be overheard. We may involve other event organisers to ensure your report is managed properly. Once safe, we\'ll ask you to tell us about what happened. This can be upsetting, but we\'ll handle it as respectfully as possible, and you can bring someone to support you. You won\'t be asked to confront anyone and we won\'t tell anyone who you are.',
      '',
      'We will be happy to help you contact venue security or local law enforcement, provide escorts, or otherwise assist you to feel safe for the duration of the event. We value your attendance.',
      '',
      '## More info',
      '',
      'This code of conduct is based on the work of the [Conference Code of Conduct](http://confcodeofconduct.com/), [CSSConf Australia](http://2016.cssconf.com.au/codeofconduct/), and the [Geek Feminism anti-harassment policy](http://geekfeminism.wikia.com/wiki/Conference_anti-harassment/Policy).',
      '',
      'If you have any feedback, recommendations for improving this policy, or wish to help in any way, please contact one of the organisers.',
    ].join('\n'),
  },
  // index.html lines 270-298 (findus page).
  findUs: {
    venueName: 'Auto & General',
    // The legacy markup names Toowong Village/Gallery Level but no single
    // street address line exists; left for manual confirmation.
    address: 'Toowong Village, Gallery Level (GL), Toowong QLD',
    mapEmbed: '', // FLAG: no embeddable map in legacy index.html (uses a static SVG).
    parking:
      'Parking is available at Toowong Village until 10:30. Find more [parking info on the Toowong Village site](http://www.toowongvillage.com.au/centre-info/getting-here/).',
    accessibility: [
      'BrisJS meetups are held on the first Monday of the month, and are hosted by Auto & General.',
      '',
      'These meetups are accessible from the *Gallery Level* (GL) elevators. This is the same level as the railway station, and one level up from Coles.',
      '',
      'Security will let people into the venue 30 minutes before and 15 minutes after the starting time. If you arrive late, you will need to get in touch with the contact on the meetup invite to arrange access.',
    ].join('\n'),
  },
};

// ---------------------------------------------------------------------------
// Importer
// ---------------------------------------------------------------------------

async function run() {
  const log = (...a) => console.log('[import]', ...a);
  log(DRY_RUN ? 'DRY RUN — no writes will be made.' : 'LIVE RUN — writing to local DB.');

  // Load source data.
  const tsv = fs.readFileSync(TSV_PATH, 'utf8');
  const twitterData = JSON.parse(fs.readFileSync(TWITTER_PATH, 'utf8'));
  const contacts = JSON.parse(fs.readFileSync(CONTACT_PATH, 'utf8'));
  const talks = parseTsv(tsv);
  log(`parsed ${talks.length} talk rows from talks.tsv`);

  // Build a case-insensitive twitter lookup (keys vary in case).
  const twitterByHandle = {};
  for (const [key, val] of Object.entries(twitterData)) {
    twitterByHandle[key.toLowerCase()] = val;
    if (val.username) twitterByHandle[String(val.username).toLowerCase()] = val;
  }

  // Bootstrap Strapi (skipped in dry-run so it can run without a DB).
  let strapi = null;
  if (!DRY_RUN) {
    const { createStrapi, compileStrapi } = require('@strapi/strapi');
    const appContext = await compileStrapi();
    strapi = await createStrapi(appContext).load();
    strapi.log.level = 'error'; // quiet the boot chatter
  }

  const counts = {
    talks: { created: 0, updated: 0 },
    speakers: { created: 0, updated: 0 },
    events: { created: 0, updated: 0 },
    organizers: { created: 0, updated: 0 },
    singles: { created: 0, updated: 0 },
  };

  // --- Generic upsert helper keyed on a filter ----------------------------
  async function upsert(uid, filters, data, bucket) {
    if (DRY_RUN) {
      bucket.created += 1; // optimistic; dry-run can't read existing rows
      return { documentId: `dry-${bucket.created}` };
    }
    const existing = await strapi.documents(uid).findMany({
      filters,
      status: 'published',
      limit: 1,
    });
    if (existing && existing.length) {
      const doc = await strapi.documents(uid).update({
        documentId: existing[0].documentId,
        data,
      });
      await strapi.documents(uid).publish({ documentId: existing[0].documentId });
      bucket.updated += 1;
      return doc;
    }
    const doc = await strapi.documents(uid).create({ data });
    await strapi.documents(uid).publish({ documentId: doc.documentId });
    bucket.created += 1;
    return doc;
  }

  // --- Speakers ------------------------------------------------------------
  // Collect unique speakers across all talks, dedupe by name, enrich.
  const speakerByName = new Map(); // name -> documentId
  const uniqueSpeakers = new Map(); // name -> {name, twitterUser}
  for (const talk of talks) {
    for (const s of talk.speakers) {
      if (!uniqueSpeakers.has(s.name)) uniqueSpeakers.set(s.name, s);
      else if (!uniqueSpeakers.get(s.name).twitterUser && s.twitterUser) {
        uniqueSpeakers.set(s.name, s);
      }
    }
  }
  log(`found ${uniqueSpeakers.size} unique speakers`);

  for (const s of uniqueSpeakers.values()) {
    const profile = s.twitterUser ? twitterByHandle[s.twitterUser.toLowerCase()] : null;
    const data = {
      name: s.name,
      twitter: s.twitterUser || null,
      bio: profile && profile.description ? profile.description : null,
      website: profile && profile.url ? profile.url : null,
      // photo is a Strapi media field — cannot set from a bare URL without an
      // upload step; left null and flagged for manual import.
    };
    const doc = await upsert('api::speaker.speaker', { name: { $eq: s.name } }, data, counts.speakers);
    speakerByName.set(s.name, doc.documentId);
  }

  // --- Events --------------------------------------------------------------
  // One Event per unique talk date.
  const eventByDate = new Map(); // YYYY-MM-DD -> documentId
  const uniqueDates = new Map(); // YYYY-MM-DD -> Date
  for (const talk of talks) {
    const key = toDateOnly(talk.date);
    if (!uniqueDates.has(key)) uniqueDates.set(key, talk.date);
  }
  log(`found ${uniqueDates.size} unique event dates`);

  for (const [key, date] of uniqueDates.entries()) {
    const data = {
      name: eventName(date),
      dateTime: toDateTime(date),
    };
    const doc = await upsert('api::event.event', { dateTime: { $eq: toDateTime(date) } }, data, counts.events);
    eventByDate.set(key, doc.documentId);
  }

  // --- Talks ---------------------------------------------------------------
  for (const talk of talks) {
    const speakerIds = talk.speakers
      .map((s) => speakerByName.get(s.name))
      .filter(Boolean);
    const eventId = eventByDate.get(toDateOnly(talk.date));
    const title = talk.title || `Talk #${talk.legacyId}`;
    const data = {
      title,
      slug: slugify(title, talk.legacyId),
      legacyId: talk.legacyId,
      date: toDateOnly(talk.date),
      synopsis: talk.synopsis,
      youtubeUrl: talk.youtubeUrl,
      slidesUrl: talk.slidesUrl,
      codeUrl: talk.codeUrl,
      speakers: speakerIds,
      event: eventId || null,
    };
    await upsert('api::talk.talk', { legacyId: { $eq: talk.legacyId } }, data, counts.talks);
  }

  // --- Organizers ----------------------------------------------------------
  let order = 0;
  for (const c of contacts) {
    order += 1;
    const data = {
      name: c.name,
      role: c.role || null,
      bio: c.bio || null,
      twitter: c.twitter || null,
      email: c.email || null,
      order,
      // photo is media — c.photo is a gravatar URL; flagged for manual upload.
    };
    await upsert('api::organizer.organizer', { name: { $eq: c.name } }, data, counts.organizers);
  }
  log(`imported ${contacts.length} organizers`);

  // --- Single types --------------------------------------------------------
  async function upsertSingle(uid, data, bucket) {
    if (DRY_RUN) {
      bucket.created += 1;
      return;
    }
    const existing = await strapi.documents(uid).findFirst({ status: 'published' });
    if (existing) {
      await strapi.documents(uid).update({ documentId: existing.documentId, data });
      await strapi.documents(uid).publish({ documentId: existing.documentId });
      bucket.updated += 1;
    } else {
      const doc = await strapi.documents(uid).create({ data });
      await strapi.documents(uid).publish({ documentId: doc.documentId });
      bucket.created += 1;
    }
  }

  await upsertSingle('api::home-page.home-page', STATIC_COPY.homePage, counts.singles);
  await upsertSingle('api::code-of-conduct.code-of-conduct', STATIC_COPY.codeOfConduct, counts.singles);
  await upsertSingle('api::find-us.find-us', STATIC_COPY.findUs, counts.singles);

  // --- Report --------------------------------------------------------------
  log('=== IMPORT SUMMARY ===');
  for (const [k, v] of Object.entries(counts)) {
    log(`  ${k}: created=${v.created} updated=${v.updated}`);
  }
  log('======================');

  if (strapi) {
    await strapi.destroy();
  }
}

run()
  .then(() => {
    console.log('[import] done.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[import] FAILED:', err);
    process.exit(1);
  });
