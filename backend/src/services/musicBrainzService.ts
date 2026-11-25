import axios from 'axios';

const MB_BASE = 'https://musicbrainz.org/ws/2';
const USER_AGENT =
  process.env.MUSICBRAINZ_USER_AGENT ||
  'SpotifyStats/1.0.0 (https://github.com/ioana-28/Spotify-Stats)';
const MIN_INTERVAL_MS = 1100;
const REQUEST_TIMEOUT_MS = 8000;

let lastRequestAt = 0;
let queue: Promise<unknown> = Promise.resolve();

function schedule<T>(task: () => Promise<T>): Promise<T> {
  const result = queue.then(async () => {
    const wait = Math.max(0, lastRequestAt + MIN_INTERVAL_MS - Date.now());
    if (wait > 0) {
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
    lastRequestAt = Date.now();
    return task();
  });
  queue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

let genreSetPromise: Promise<Set<string>> | null = null;

export function getCanonicalGenreSet(): Promise<Set<string>> {
  if (!genreSetPromise) {
    genreSetPromise = schedule(async () => {
      const response = await axios.get(`${MB_BASE}/genre/all?fmt=txt`, {
        headers: { 'User-Agent': USER_AGENT },
        responseType: 'text',
        timeout: REQUEST_TIMEOUT_MS,
      });
      return new Set(
        String(response.data)
          .split('\n')
          .map((line) => line.trim().toLowerCase())
          .filter(Boolean),
      );
    }).catch(() => {
      // MusicBrainz can be busy; retry on a later request instead of
      // caching an empty genre list for the lifetime of the process.
      genreSetPromise = null;
      return new Set<string>();
    });
  }
  return genreSetPromise;
}

export async function getMusicBrainzGenres(
  artistName: string,
): Promise<string[]> {
  const cleanedName = artistName.replace(/"/g, ' ').trim();
  if (!cleanedName) return [];

  const response = await schedule(() =>
    axios.get(`${MB_BASE}/artist`, {
      params: {
        query: `artist:"${cleanedName}"`,
        fmt: 'json',
        limit: 5,
      },
      headers: { 'User-Agent': USER_AGENT },
      timeout: REQUEST_TIMEOUT_MS,
    }),
  );

  const artists: any[] = response.data?.artists ?? [];
  const best =
    artists.find((artist) => Number(artist.score) >= 80) ?? artists[0];
  if (!best) return [];

  const tags: any[] = Array.isArray(best.tags) ? best.tags : [];
  return dedupe(
    tags
      .slice()
      .sort((a, b) => Number(b.count ?? 0) - Number(a.count ?? 0))
      .map((tag) => String(tag.name ?? '')),
  );
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
