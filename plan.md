# Spotify Stats — Implementation Plan

Working document. Update the checkboxes and the Progress Log as features land.
**Do not commit or push until explicitly requested.**

Last updated: 2026-11-25

---

## Current status

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Secure Spotify login | 🟢 Done | Token refresh + expiry, `state` validated, signed session cookie, refresh token encrypted at rest |
| 2 | Top artists & top tracks | 🟢 Done | limit=10 only; snapshot cross-copy quirk |
| 3 | Genre breakdown | 🟢 Done | Spotify `artist.genres` deprecated; Last.fm fallback unthrottled |
| 4 | Decade / release-year analysis | 🟢 Done | "Time Capsule" in Statistics; era history API unused by UI |
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
- [ ] Raise `limit` from 10 to 50 (or make it configurable / paginated).
- [ ] Decouple the snapshot cross-copy: top artists and top tracks each cloning the other list from a possibly older snapshot (`topArtistController.ts`, `topTrackController.ts`). Either fetch both in one endpoint or store them independently with the same timestamp.

### Feature 3 — Genre breakdown
- [ ] Add throttling / caching for Last.fm `gettoptags` calls (currently up to 50 unthrottled per request).
- [ ] Map raw Last.fm tags into broader genre categories for readability (as described in the spec).
- [ ] Handle empty-genre artists gracefully and surface a clear "not enough data" state.

### Feature 4 — Decade / release-year analysis
- [ ] Surface era history in the UI (endpoint `GET /api/stats/time-capsule/history` already exists).
- [ ] Consider weighting by play rank vs. plain counts (document the choice).

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
- LLM provider and budget for Feature 7.
- How long to retain play history (Feature 9) and privacy implications.

---

## Progress Log

| Date | Phase | What changed | Verified by |
|------|-------|--------------|-------------|
| 2026-11-23 | — | Created plan; audited codebase (5/9 features done) | code review |
| 2026-11-25 | 1 | Login fixed: token refresh + `expiresAt`, `state` check, signed cookie, removed `/session` bypass, encrypted refresh token, env-driven redirects | `tsc --noEmit`, prisma migrate, crypto round-trip test |
| 2026-11-25 | 1 | Local dev aligned to `127.0.0.1` (frontend fetches, login link, `FRONTEND_URL`, redirect URI) after `localhost`/`127.0.0.1` cookie-host mismatch | Spotify redirect URI acceptance + manual login |
| 2026-11-25 | 2 | Now playing: live progress bar (local 1s tick), paused state keeps track visible, podcast episodes handled | `tsc --noEmit` (backend), `tsc -b` (frontend); manual pending |
