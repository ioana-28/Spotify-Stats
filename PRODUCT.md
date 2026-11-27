# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The owner and a small circle of invited friends — Spotify listeners who want to understand their own listening habits. They sign in with Spotify and browse their stats year-round, often revisiting to see how taste shifts over time.

## Product Purpose

Turns a Spotify account into an always-available view of listening taste: top artists and tracks, genre breakdown, release-era analysis, mainstream-vs-underground score, now-playing, and friend comparison. Success means the user learns something true and surprising about their own listening that Spotify Wrapped does not show.

## Positioning

Year-round, private-by-default analysis that goes past top-5 lists: decade/era timelines, sourced genre categorization, a taste-score, and consented friend comparison — available any day, not once a year.

## Operating Context

- Secured by Spotify OAuth; session is a signed cookie, refresh tokens encrypted at rest.
- Local development uses `127.0.0.1` everywhere (frontend `:5173`, backend `:5000`, redirect `:5000/api/auth/callback`) because cookies are host-scoped.
- Genre data comes from MusicBrainz (primary) with Last.fm fallback, cached in Postgres.
- Durable data model: users, artist/track snapshots, artist-genre cache, era/time-capsule history.

## Capabilities and Constraints

- Implemented: secure login with token refresh; top artists and top tracks (10-item lists, decoupled snapshots); genre breakdown with broad categories; decade/release-era analysis and Era Timeline; live now-playing with progress and podcast support.
- Planned (from `plan.md`): mainstream-vs-underground score, animated Wrapped slideshow with AI text, friend comparison, listening history and activity patterns.
- Spotify API limits are respected: MusicBrainz kept near 1 req/sec, Last.fm capped at 4 concurrent, recently-played limited to the last 50 plays (no backfill).
- No scraping, no third-party analytics; listening data is private by default and never shared without explicit consent.
- Undecided: deployment target and redirect URIs, LLM provider/budget for Wrapped text, play-history retention and privacy policy.

## Evidence on Hand

- `plan.md` holds the authoritative feature status, phase decisions, and a verified progress log (cold/warm genre timings, migration names, manual checks).
- No testimonials, press, customer logos, or benchmark claims exist; future work must not invent them.

## Product Principles

1. Private by default: no listening data leaves the user's control without explicit consent.
2. Go deeper than Wrapped: every surface should reveal something a top-5 list cannot.
3. Respect the platform: honor Spotify and MusicBrainz limits rather than working around them.
4. Always available: stats should be current and useful on any day, not just year-end.
5. Honest data: never fabricate figures, testimonials, or trends; show real values or an honest empty state.

## Accessibility & Inclusion

No product-specific accessibility requirement has been established yet.
