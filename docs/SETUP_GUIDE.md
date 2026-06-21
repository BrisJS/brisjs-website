# BrisJS — Cloud Setup Guide (step by step)

> Companion to `docs/HUMAN_TODO.md`. This walks you through the cloud wiring click-by-click.
> Do the steps **in order** — later steps need values you copy in earlier ones.
> Branch to use throughout: **`new-modern-refactor-astro-strapi-netlify`** (keeps the live
> `brisjs.org` on `master` untouched until the final cutover).
>
> 🔑 **Values you'll collect** (keep them in a scratch note as you go):
> | Name | From step | Looks like |
> |------|-----------|-----------|
> | `STRAPI_API_URL` | 1.5 | `https://abcd1234.strapiapp.com` |
> | Read-only API token | 1.6 | a long string |
> | Transfer token | 2.1 | a long string |
> | Netlify build hook URL | 3.5 | `https://api.netlify.com/build_hooks/xxxx` |
>
> 💡 You can hand any of these to me and I'll run the content transfer (step 2) and verify the
> webhook (step 4) with you — those are the parts I can do once credentials exist.

---

## Step 1 — Strapi Cloud (the CMS backend)

**1.1 Sign up** — go to https://cloud.strapi.io and sign in with **GitHub** (free plan is fine).

**1.2 Create a project** — click **Create project** → **Import from GitHub** → authorise Strapi
to see the `brisjs-website` repo → select it.

**1.3 Configure the build:**
- **Branch:** `new-modern-refactor-astro-strapi-netlify`
- **Base directory:** `cms`
- **Display name / region:** your choice (pick the closest region, e.g. Australia/Asia).
- Leave the rest default. Strapi Cloud auto-generates the secret keys (`APP_KEYS`, etc.) — you
  do **not** set those.

**1.4 Deploy** — click **Create project**. First build takes a few minutes. When it's done you
get a project URL.

**1.5 Note the API URL** — it looks like `https://<something>.strapiapp.com`. This whole URL is
your **`STRAPI_API_URL`** (the frontend appends `/api` itself). Copy it to your scratch note.

**1.6 Create the admin user + API token:**
- Open `https://<your-project>.strapiapp.com/admin` → register the first admin user.
- You should see the content types (Talk, Speaker, Event, Job Posting, Talk Request, Organizer,
  Home Page, Code Of Conduct, Find Us) in the left sidebar — that confirms the schema deployed.
- Go to **Settings → API Tokens → Create new API Token**:
  - Name: `astro-build`
  - Token type: **Read-only**
  - Duration: **Unlimited**
  - **Copy the token now** (it's shown only once) → that's your read-only API token.

**1.7 Confirm public read access** — our code grants the Public role read access on every boot
(`cms/src/index.js`), so this should already be set. Verify by opening
`https://<your-project>.strapiapp.com/api/talks` in a browser — you should get JSON
(`{"data":[],...}` is fine; it'll be empty until step 2).

✅ **Done when:** the admin loads, content types are listed, and `/api/talks` returns JSON.

---

## Step 2 — Get the content into the cloud

The cloud database starts **empty**. The importer (`npm run import:legacy`) seeds a *local*
Strapi, so we seed locally and then **transfer** to the cloud.

**2.1 Create a Transfer Token** in Strapi Cloud: **Settings → Transfer Tokens → Create** →
type **Push** (or Full access) → copy it.

**2.2 Hand me the cloud URL + transfer token and I'll run it** — or do it yourself locally
(needs Node 22):

```bash
cd cms
nvm use 22
npm install                       # if you haven't already
npm run import:legacy             # seeds local SQLite: 227 talks etc.
# push the local content up to the cloud:
npx strapi transfer --to https://<your-project>.strapiapp.com/admin --to-token <TRANSFER_TOKEN>
```

**2.3 Manual content the importer can't do** (see `cms/README.md`):
- In the cloud admin, upload **speaker & organizer photos** (legacy data only had image URLs).
- Set **Find Us → mapEmbed** (the old site used a static image).
- **Publish** anything that should be live (the importer publishes, but double-check after transfer).

**2.4 Take a backup** once it's in: `cd cms && npm run backup` → store the archive somewhere safe.

✅ **Done when:** `https://<your-project>.strapiapp.com/api/talks` returns the real talks.

---

## Step 3 — Netlify (the frontend host)

> You already have a Netlify project serving the old site from `master`. To avoid touching the
> live site, create a **new** Netlify site from the branch for testing; we switch the domain
> over only at cutover (Step 5).

**3.1 New site** — Netlify dashboard → **Add new site → Import an existing project** → GitHub →
pick `brisjs-website`.

**3.2 Branch & build** — set **Branch to deploy:** `new-modern-refactor-astro-strapi-netlify`.
The build settings come from `netlify.toml` automatically (base `web`, build `npm run build`,
publish `web/dist`, Node 22) — you shouldn't need to type them.

**3.3 Add environment variables** *(before the first build)* — **Site configuration →
Environment variables → Add a variable** (set for all contexts):
- `STRAPI_API_URL` = the URL from step 1.5
- `STRAPI_API_TOKEN` = the read-only token from step 1.6

> Without these the build still works but shows placeholder fixture data — so set them first.

**3.4 Deploy** — trigger the deploy. When it's green, open the `https://<random>.netlify.app`
URL and check the talks/speakers are the real ones from Strapi. Compare against
`docs/baseline/*.png` — it should look like the current site.

**3.5 Create a build hook** — **Site configuration → Build & deploy → Build hooks → Add build
hook** → name it `strapi-publish` → branch = the migration branch → **copy the URL**.

**3.6 Deploy previews** — confirm **Deploy Previews** are enabled (default) so PRs get preview URLs.

✅ **Done when:** the `*.netlify.app` site renders real Strapi content and matches the baseline.

---

## Step 4 — Auto-rebuild on publish (Strapi → Netlify)

So that editing content re-publishes the site automatically.

**4.1** In Strapi Cloud admin → **Settings → Webhooks → Create new webhook**:
- Name: `netlify-build`
- URL: the **build hook URL** from step 3.5
- Events: check **Entry → publish, unpublish, delete** (and update if you want edits to redeploy).
- Save.

**4.2 Test it** — edit & publish any entry in Strapi → watch Netlify start a new deploy.
(Hand me the build-hook URL and I can help verify this end to end.)

✅ **Done when:** publishing in Strapi triggers a Netlify build.

---

## Step 5 — Cutover (only when you're happy with the preview)

This makes it live and is the point of no return — do it deliberately.

1. Final check: preview site vs `docs/baseline/*.png`; click through talks, a talk detail, jobs,
   contact, find-us; try an old link like `https://<preview>/#talk-2` (should redirect).
2. Merge `new-modern-refactor-astro-strapi-netlify` → `master` (open a PR; I can help review).
3. Point **`brisjs.org`** at the new Netlify site (Domain settings) and remove the domain from
   the old site. Fix the repo `CNAME` (`bris.js.org` → `brisjs.org`).
4. I'll then do the **cleanup commit** (remove the legacy `app.js`/`index.html`/`style.css`/etc.
   per ADR-006) and update the architecture docs.

---

## If something looks wrong
- **Site shows placeholder/sample content, not real talks** → `STRAPI_*` env vars not set on
  Netlify (step 3.3), or the transfer (step 2) hasn't run.
- **Build fails on Netlify** → check the deploy log; if it's a Strapi fetch error, that's the
  fail-loud guard doing its job (bad/empty `STRAPI_API_URL`/token).
- **`/api/talks` is empty** → content transfer (step 2) didn't complete.
- **Anything Strapi locally won't boot** → you're on Node 26; run `nvm use 22`.

Stuck on any step? Tell me where you are (and share the relevant URL/token if it's step 2 or 4)
and I'll take it from there.
