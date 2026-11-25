import type { ArtistGenreCache, PrismaClient } from '@prisma/client';
import { getArtistGenres as getLastFmGenres } from './lastFmService.js';
import {
  getCanonicalGenreSet,
  getMusicBrainzGenres,
} from './musicBrainzService.js';
import { isJunkTag } from './genreCategoryMapper.js';

export type GenreSource = 'musicbrainz' | 'lastfm' | 'none';

export interface ResolvedGenres {
  genres: string[];
  source: GenreSource;
}

const MB_BUDGET = Number(process.env.GENRE_MB_BUDGET) || 10;
const LASTFM_CONCURRENCY = 4;
const MB_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const LASTFM_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const NONE_TTL_MS = 24 * 60 * 60 * 1000;

function nameKey(name: string): string {
  return name.trim().toLowerCase();
}

function ttlFor(source: string): number {
  if (source === 'musicbrainz') return MB_TTL_MS;
  if (source === 'lastfm') return LASTFM_TTL_MS;
  return NONE_TTL_MS;
}

function isFresh(entry: ArtistGenreCache): boolean {
  return Date.now() - entry.updatedAt.getTime() < ttlFor(entry.source);
}

function dedupe(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}

function cleanGenres(
  raw: string[],
  genreSet: Set<string>,
  knownArtistNames: Set<string>,
): string[] {
  const deduped = dedupe(raw);
  const withoutJunk = deduped.filter(
    (genre) => !isJunkTag(genre, knownArtistNames),
  );
  const canonical =
    genreSet.size > 0
      ? withoutJunk.filter((genre) => genreSet.has(genre.toLowerCase()))
      : withoutJunk;
  const chosen = canonical.length > 0 ? canonical : withoutJunk;
  return chosen.slice(0, 5);
}

async function resolveLastFm(
  name: string,
  genreSet: Set<string>,
  knownArtistNames: Set<string>,
): Promise<string[]> {
  const raw = await getLastFmGenres(name);
  return cleanGenres(raw, genreSet, knownArtistNames);
}

async function saveGenres(
  prisma: PrismaClient,
  name: string,
  genres: string[],
  source: GenreSource,
): Promise<void> {
  await prisma.artistGenreCache.upsert({
    where: { nameKey: nameKey(name) },
    update: { genres, source },
    create: { nameKey: nameKey(name), genres, source },
  });
}

async function mapWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  const size = Math.max(1, Math.min(limit, items.length));
  const runners = Array.from({ length: size }, async () => {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) return;
      const item = items[index];
      if (item === undefined) return;
      await worker(item);
    }
  });
  await Promise.all(runners);
}

async function resolveMusicBrainzCandidates(
  prisma: PrismaClient,
  candidates: { name: string; index: number }[],
  genreSet: Set<string>,
  knownArtistNames: Set<string>,
  result: Map<string, ResolvedGenres>,
): Promise<void> {
  let musicBrainzHealthy = true;

  for (const { name } of candidates) {
    let genres: string[] = [];

    if (musicBrainzHealthy) {
      try {
        genres = cleanGenres(
          await getMusicBrainzGenres(name),
          genreSet,
          knownArtistNames,
        );
      } catch {
        musicBrainzHealthy = false;
      }
    }

    if (genres.length > 0) {
      await saveGenres(prisma, name, genres, 'musicbrainz');
      result.set(name, { genres, source: 'musicbrainz' });
      continue;
    }

    const fallback = await resolveLastFm(name, genreSet, knownArtistNames);
    const source: GenreSource = fallback.length > 0 ? 'lastfm' : 'none';
    await saveGenres(prisma, name, fallback, source);
    result.set(name, { genres: fallback, source });
  }
}

export async function resolveArtistGenres(
  prisma: PrismaClient,
  artists: string[],
): Promise<Map<string, ResolvedGenres>> {
  const result = new Map<string, ResolvedGenres>();
  if (artists.length === 0) return result;

  const knownArtistNames = new Set(
    artists.map((name) => name.trim().toLowerCase()).filter(Boolean),
  );

  const cached = await prisma.artistGenreCache.findMany({
    where: { nameKey: { in: artists.map(nameKey) } },
  });
  const cacheByKey = new Map(
    cached.map((entry) => [entry.nameKey, entry] as const),
  );

  const pending: { name: string; index: number }[] = [];
  artists.forEach((name, index) => {
    const entry = cacheByKey.get(nameKey(name));
    if (entry && isFresh(entry)) {
      result.set(name, {
        genres: entry.genres,
        source: entry.source as GenreSource,
      });
      return;
    }
    pending.push({ name, index });
  });

  if (pending.length === 0) return result;

  const genreSet = await getCanonicalGenreSet();
  const musicBrainzCandidates = pending.filter(
    (candidate) => candidate.index < MB_BUDGET,
  );
  const lastFmCandidates = pending.filter(
    (candidate) => candidate.index >= MB_BUDGET,
  );

  await Promise.all([
    resolveMusicBrainzCandidates(
      prisma,
      musicBrainzCandidates,
      genreSet,
      knownArtistNames,
      result,
    ),
    mapWithConcurrency(lastFmCandidates, LASTFM_CONCURRENCY, async ({ name }) => {
      const genres = await resolveLastFm(name, genreSet, knownArtistNames);
      const source: GenreSource = genres.length > 0 ? 'lastfm' : 'none';
      await saveGenres(prisma, name, genres, source);
      result.set(name, { genres, source });
    }),
  ]);

  return result;
}
