# Spotify Stats — Implementation Plan

Working document. Update the checkboxes and the Progress Log as features land.
**Do not commit or push until explicitly requested.**

Last updated: 2026-11-25

---

## Current status

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Secure Spotify login | 🟢 Done | Token refresh + expiry, `state` validated, signed session cookie, refresh token encrypted at rest |
| 2 | Top artists & top tracks | 🟢 Done | 10-item lists; artist and track snapshots decoupled (no cross-copy) |
| 3 | Genre breakdown | 🟢 Done | MusicBrainz primary + Last.fm fallback; DB cache, throttling, broad categories |
| 4 | Decade / release-year analysis | 🟢 Done | Time Capsule + Era Timeline UI (newest-first, 10 + show-all); multi-range repeats kept by design |
| 5 | Mainstream vs. underground score | 🔴 Not started | `artist.popularity` already available from Spotify |
| 6 | Now playing widget | 🟢 Done | Live progress bar, paused state shows current track, podcast episodes handled |
| 7 | Animated Wrapped slideshow + AI text | 🔴 Not started | Needs slideshow UI + LLM integration |
| 8 | Friend comparison | 🔴 Not started | Needs invite/consent tables + matching |
| 9 | Listening history & activity patterns | 🔴 Not started | Spotify only returns last 50 plays; needs periodic sync |

Legend: 🟢 done · 🟡 partial / needs hardening · 🔴 not started

---

## Ground rules

- One phase at a time; each phase ends in a verifiable state.
- After each phase: update this file (status table, checklists, Progress Log).
- Run `npm run lint` (frontend) and a type/build check before marking a phase done.
- Do not commit or push until the user says so.

---

## Local dev host convention

Use **`127.0.0.1` everywhere** — frontend, API, and the Spotify redirect URI. Cookies are scoped by hostname, so mixing `localhost` and `127.0.0.1` breaks both the OAuth `state` cookie and the session cookie.

- Frontend: `http://127.0.0.1:5173`
- Backend: `http://127.0.0.1:5000`
- Spotify Redirect URI (must match the developer dashboard exactly): `http://127.0.0.1:5000/api/auth/callback`

---

## Phase 1 — Harden authentication & session (Feature 1)

**Why first:** everything depends on a valid token; the app currently breaks ~1h after login.

- [x] Add `expiresAt` (from `expires_in`) to the `User` model + migration.
      Migration: `20261125173152_add_token_expiry`.
- [x] Create a shared `getValidAccessToken(user)` helper that refreshes via the token endpoint when expired, persists new `accessToken`/`refreshToken`/`expiresAt`. (`src/lib/spotify.ts`)
- [x] Replace direct `user.accessToken` usage in every controller with the helper
      (`dashboardController`, `genreController`, `topArtistController`, `topTrackController`, `statsController`).
- [x] Validate OAuth `state`: store in an httpOnly cookie at `/login`, compare in `/callback`, clear after use.
- [x] Sign the session cookie (via `cookieParser(SESSION_SECRET)`) so the raw user id can't be spoofed.
- [x] Remove the public `/api/auth/session?userId=` endpoint (was an auth bypass).
- [x] Move hardcoded redirect URLs to env vars (`FRONTEND_URL`); backend no longer redirects to itself.
- [x] Handle refresh failure → controllers return `401`, frontend redirects to login.
- [x] Encrypt the refresh token at rest (AES-256-GCM, `src/lib/crypto.ts`); legacy plaintext values still decrypt and get upgraded on next refresh.
- [x] Friendly redirect on Spotify cancel/denial (`/login?error=...`).

**Decisions:** signed cookie session (no new table); refresh token encrypted, access token left plaintext (short-lived); PKCE deferred (confidential server-side client).

**Verification done:** `prisma generate` + `migrate dev` applied; `tsc --noEmit` clean; crypto encrypt/decrypt round-trip tested; frontend lint errors are pre-existing in the unrelated in-progress restyle.

**Done when:** a request still works after the access token has expired; a tampered/absent state or session cookie is rejected.

---

## Phase 2 — Improve existing features (2, 3, 4, 6)

### Feature 2 — Top artists & tracks
- [x] Keep the page lists at **10** (decided). Decade/Time Capsule and Genres keep fetching **50** behind the scenes.
- [x] Decouple artist/track snapshots: Top Artists stores only artists, Top Tracks stores only tracks; the dashboard reads the latest artist snapshot and latest track snapshot separately. Queries filter to snapshots that actually contain that list, so no cross-copy and no empty-panel mixups.

### Feature 3 — Genre breakdown
- [x] Genre source pipeline: **MusicBrainz primary, Last.fm fallback**.
      - `services/musicBrainzService.ts`: artist search returns `tags` (not `genres`); serialized at ~1 request/sec per MusicBrainz policy; meaningful `User-Agent` (override with `MUSICBRAINZ_USER_AGENT`).
      - `services/lastFmService.ts`: existing top-tags call, now up to 5 tags (fallback only).
      - `services/genreService.ts`: per-artist resolution, canonical-genre filtering, DB cache, MusicBrainz budget, Last.fm concurrency.
- [x] Caching + throttling:
      - New `ArtistGenreCache` table (`nameKey` unique, `genres`, `source`, `updatedAt`); migration `20261125201710_add_artist_genre_cache`.
      - TTLs: MusicBrainz 30 days, Last.fm 7 days, empty result 1 day.
      - MusicBrainz calls serialized at ~1.1s; Last.fm capped at 4 concurrent requests.
      - `GENRE_MB_BUDGET` (default **10**): only the top-ranked artists try MusicBrainz; the rest go straight to Last.fm so cold loads stay reasonable. If MusicBrainz fails (e.g. 503), remaining MB attempts are skipped and everything falls back to Last.fm.
- [x] Broad categories: `services/genreCategoryMapper.ts` maps raw tags to Pop, Rock, Hip-Hop/Rap, R&B/Soul, Electronic/Dance, Indie/Alternative, Metal, Punk, Country, Folk/Acoustic, Jazz, Blues, Classical, Latin, Reggae, World, Soundtrack, Other.
- [x] Per-artist categories are de-duplicated before scoring: an artist tagged `dance pop` + `electropop` counts once toward Pop.
- [x] **"Other" is never shown as a genre**: unmapped tags are excluded from both the list and the percentage denominator, so `Other` can't rank first.
- [x] Junk filtering for Last.fm tags: `isJunkTag()` removes decades/years (`80s`), nationalities/locations (`australian`, `texas`, `puerto rico`), artist names (any of the user's top-artist names, e.g. "Ariana Grande"), and generic phrases (`my top songs`). Seeded `JUNK_TAGS` still covers `seen live`, `favourite`, etc.
- [x] Existing cached rows were re-cleaned so the junk already stored no longer appears.
- [x] Empty state message on the Genres page now reads "Not enough genre data yet."

**Notes / trade-offs**
- Cold load (uncached artists) can take roughly 5–15s due to MusicBrainz's 1 req/sec limit; cached loads are instant. Verified on 5 artists: **4.9s cold → 0.7s warm**.
- Only the top `GENRE_MB_BUDGET` artists per time range get MusicBrainz-quality genres; tail artists use Last.fm and are cached. If a Last.fm-cached artist later enters the MB budget, it upgrades after the 7-day TTL.
- The MusicBrainz canonical genre list is fetched once and cached in memory; if that fetch fails (MusicBrainz can return 503), it is **not cached as empty** — the next request retries.
- Optional env vars: `MUSICBRAINZ_USER_AGENT` (include contact/URL), `GENRE_MB_BUDGET`.

### Feature 4 — Decade / release-year analysis
- [x] Surface era history in the UI: new **"Era Timeline"** section on Statistics using `GET /api/stats/time-capsule/history`.
      - Newest-first; shows the latest 10 with a "Show all (N)" / "Show less" toggle.
      - Each row: date, dominant-decade chip, and a stacked era bar (segment widths from each era's `score` share).
      - History is fetched **after** the time-capsule call so the snapshot just saved is included; empty/loading/error states handled.
- [x] Weighting decision: **keep the current triple-count** — a track that appears in multiple time ranges intentionally counts multiple times as a stronger long-term signal. No `eraService` change.

### Feature 6 — Now playing
- [x] Render a progress bar using `progressMs` / `durationMs` already returned by the API.
- [x] Show a paused/ended state cleanly and avoid `Left: -1s` style bugs when polling lags.
      The bar ticks locally every 1s between 10s polls; paused state keeps the current track visible.
- [x] Handle podcast episodes (request `additional_types=track,episode`, image from `item.images` or `item.show.images`, show name instead of artist, no album).

---

## Phase 3 — Mainstream vs. underground score (Feature 5)

- [ ] Store `popularity` on `TopArtist` (model + migration).
- [ ] Populate it when fetching top artists (Spotify `/me/top/artists` returns it).
- [ ] Compute a 0–100 taste score (e.g. rank-weighted average popularity) in a new service.
- [ ] Expose via API + add a UI card with a plain-language label (mainstream / balanced / underground).
- [ ] Time ranges: compute per range, consistent with other pages.

---

## Phase 4 — Now playing / dashboard polish + Wrapped slideshow (Feature 7)

- [ ] Aggregate existing data (top artists/tracks, genres, eras, score) into slide payloads.
- [ ] Build swipeable, animated slideshow component (count-up numbers, transitions).
- [ ] Add AI-generated personalized text per slide:
  - [ ] Choose provider + add key to env (server-side only).
  - [ ] Generate text server-side, cache per user + snapshot to avoid repeat cost.
  - [ ] Graceful fallback to template text if the LLM call fails.

---

## Phase 5 — Friend comparison (Feature 8)

- [ ] Schema: invites (token, inviter, expiry), consent state, comparison results.
- [ ] Invite link + consent step (both users must opt in).
- [ ] Taste compatibility score (shared artists/tracks/genres + score similarity).
- [ ] UI for shared items and compatibility percentage.

---

## Phase 6 — Listening history & activity patterns (Feature 9)

**Feasibility caveat:** Spotify `/me/player/recently-played` returns only the last 50 plays — no past backfill.

- [ ] Schema: `Play` (userId, trackId, artist, playedAt, …) with dedupe on (userId, trackId, playedAt).
- [ ] Periodic sync job to poll recently-played and accumulate history.
- [ ] Listening clock (hours of day) derived from `playedAt`.
- [ ] Day-of-week × hour heatmap.
- [ ] Daily activity calendar (only meaningful after data accumulates).

---

## Deferred / open questions

- Deployment target & redirect URIs (login is env-driven now; update `.env` / Spotify dashboard on deploy).
- PKCE for the OAuth flow (deferred; optional for a confidential client).
- MusicBrainz has a 1 req/sec limit, so first-time genre loads are slower; consider a background warm-up job/endpoint if it becomes annoying.
- Set `MUSICBRAINZ_USER_AGENT` with real contact info (required by MusicBrainz) before any public deployment.
- LLM provider and budget for Feature 7.
- How long to retain play history (Feature 9) and privacy implications.

---

## Progress Log

| Date | Phase | What changed | Verified by |
|------|-------|--------------|-------------|
| 2026-11-23 | — | Created plan; audited codebase (5/9 features done) | code review |
| 2026-11-25 | 1 | Login fixed: token refresh + `expiresAt`, `state` check, signed cookie, removed `/session` bypass, encrypted refresh token, env-driven redirects | `tsc --noEmit`, prisma migrate, crypto round-trip test |
| 2026-11-25 | 1 | Local dev aligned to `127.0.0.1` (frontend fetches, login link, `FRONTEND_URL`, redirect URI) after `localhost`/`127.0.0.1` cookie-host mismatch | Spotify redirect URI acceptance + manual login |
| 2026-11-25 | 2 | Now playing: live progress bar (local 1s tick), paused state keeps track visible, podcast episodes handled (`additional_types=track,episode`) | `tsc` (backend/frontend); manually verified: songs, pause, progress, podcast episode |
| 2026-11-25 | 2 | Top lists: decoupled artist/track snapshots, removed cross-copy; page limit kept at 10 | `tsc --noEmit` (backend) |
| 2026-11-25 | 2 | Genres: MusicBrainz primary + Last.fm fallback, `ArtistGenreCache` (migration `20261125201710_add_artist_genre_cache`), throttling/concurrency, broad category mapping, empty state | `tsc` (backend/frontend); live pipeline test (4.9s cold → 0.7s warm) |
| 2026-11-25 | 2 | Genres: fixed "Other" dominating — expanded junk filter (decades, locations, artist-name tags, generic phrases), excluded Other from the chart, re-cleaned cached rows, retry MusicBrainz genre-list fetch | `tsc` (backend); live check: Other removed, Pop now #1 |
| 2026-11-25 | 2 | Genres page: removed artist counts and artist pills (category/percentage/bar only); unused CSS cleaned | `tsc -b` (frontend) |
| 2026-11-25 | 2 | Era analysis: added Era Timeline UI (newest-first, latest 10 + show-all toggle, stacked era bars); kept multi-range weighting by design | `tsc -b` (frontend) |
