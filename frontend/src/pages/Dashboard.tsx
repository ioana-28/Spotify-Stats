import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Mic2, Music, Disc3, Radio, Pause } from 'lucide-react';
import { colors } from '../theme';
import styles from '../styles/Dashboard.module.css';
import shared from '../styles/StatsShared.module.css';

interface TopArtist {
  id?: string;
  spotifyId: string;
  name: string;
  genres: string[];
  imageUrl: string | null;
  rank: number;
}

interface TopTrack {
  id?: string;
  spotifyId: string;
  name: string;
  artist: string;
  album: string;
  imageUrl: string | null;
  rank: number;
}

interface DashboardData {
  artists: TopArtist[];
  tracks: TopTrack[];
  artistsUpdatedAt?: string | null;
  tracksUpdatedAt?: string | null;
}

interface CurrentlyPlayingTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  imageUrl: string | null;
  durationMs: number;
}

interface CurrentlyPlayingResponse {
  isPlaying: boolean;
  progressMs: number;
  type: 'track' | 'episode';
  track: CurrentlyPlayingTrack | null;
}

interface CurrentlyPlaying extends CurrentlyPlayingResponse {
  fetchedAt: number;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatRelativeTime(iso: string | null): string | null {
  if (!iso) return null;
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return null;

  const diff = Math.max(0, Date.now() - time);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(time).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function latestTimestamp(values: Array<string | null | undefined>): string | null {
  let latest: string | null = null;
  let latestTime = Number.NEGATIVE_INFINITY;

  for (const value of values) {
    if (!value) continue;
    const time = new Date(value).getTime();
    if (!Number.isNaN(time) && time > latestTime) {
      latest = value;
      latestTime = time;
    }
  }

  return latest;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({ artists: [], tracks: [] });
  const [error, setError] = useState<string | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<CurrentlyPlaying | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/dashboard', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        return res.json();
      })
      .then((payload: DashboardData) => {
        setData(payload);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const fetchCurrentlyPlaying = () => {
      fetch('http://127.0.0.1:5000/api/dashboard/currently-playing', {
        credentials: 'include',
      })
        .then((res) => {
          if (!res.ok) return null;
          return res.json();
        })
        .then((payload: CurrentlyPlayingResponse | null) => {
          if (payload) {
            setCurrentlyPlaying({ ...payload, fetchedAt: Date.now() });
          }
        })
        .catch(() => {});
    };
    fetchCurrentlyPlaying();
    const interval = setInterval(fetchCurrentlyPlaying, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!currentlyPlaying?.isPlaying) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [currentlyPlaying?.isPlaying]);

  const track = currentlyPlaying?.track ?? null;
  const durationMs = track?.durationMs ?? 0;
  const elapsed = currentlyPlaying?.isPlaying
    ? Math.max(0, now - currentlyPlaying.fetchedAt)
    : 0;
  const rawProgress = (currentlyPlaying?.progressMs ?? 0) + elapsed;
  const progressMs = durationMs > 0 ? Math.min(durationMs, rawProgress) : rawProgress;
  const progressPercent =
    durationMs > 0 ? Math.min(100, (progressMs / durationMs) * 100) : 0;
  const hasTrack = Boolean(track);
  const isPlaying = Boolean(currentlyPlaying?.isPlaying);

  const statusLabel = !hasTrack
    ? 'Not playing'
    : isPlaying
      ? 'Now playing'
      : 'Paused';

  const announcement = hasTrack
    ? `${statusLabel}: ${track?.name} by ${track?.artist}`
    : 'Nothing playing right now';

  const updatedAt = latestTimestamp([data.artistsUpdatedAt, data.tracksUpdatedAt]);
  const updatedLabel = formatRelativeTime(updatedAt);
  const artGradients = [styles.artA, styles.artB, styles.artC];

  return (
    <div className={`${shared.pageBg} ${styles.page}`}>
        <Sidebar />

        <main className={styles.main}>

          {loading && (
            <section
              className={styles.skeletonBento}
              aria-busy="true"
              aria-label="Loading your top lists"
            >
              <div className={`${styles.card} ${styles.skeletonNow}`}>
                <div className={`${shared.skeletonShimmer} ${styles.skeletonLabel}`} />
                <div className={`${shared.skeletonShimmer} ${styles.skeletonArt}`} />
                <div className={`${shared.skeletonShimmer} ${styles.skeletonName}`} />
                <div className={`${shared.skeletonShimmer} ${styles.skeletonSub}`} />
                <div className={`${shared.skeletonShimmer} ${styles.skeletonBar}`} />
              </div>
              {[0, 1].map((column) => (
                <div
                  key={column}
                  className={`${styles.card} ${styles.skeletonList}`}
                >
                  <div className={`${shared.skeletonShimmer} ${styles.skeletonHead}`} />
                  {[0, 1, 2].map((row) => (
                    <div key={row} className={styles.skeletonRow}>
                      <div
                        className={`${shared.skeletonShimmer} ${styles.skeletonAvatar}`}
                      />
                      <div className={styles.skeletonInfo}>
                        <div
                          className={`${shared.skeletonShimmer} ${styles.skeletonRowName}`}
                        />
                        <div
                          className={`${shared.skeletonShimmer} ${styles.skeletonRowSub}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </section>
          )}

          {error && !loading && (
            <section className={styles.errorCard} role="alert">
              <h2 className={styles.errorTitle}>Couldn’t load your top lists</h2>
              <p className={styles.errorText}>
                Check your connection, then refresh the page to try again.
              </p>
            </section>
          )}

          {!loading && !error && (
            <div className={styles.bento}>
              <section
                className={`${styles.card} ${styles.nowTile}`}
                aria-labelledby="now-playing-heading"
              >
                <h2 id="now-playing-heading" className={styles.srOnly}>
                  Now playing
                </h2>

                <div className={styles.nowTop}>
                  <div className={styles.status}>
                    {isPlaying ? (
                      <span className={styles.liveDot} aria-hidden="true" />
                    ) : hasTrack ? (
                      <Pause
                        size={13}
                        color={colors.inkSoft}
                        strokeWidth={3}
                        aria-hidden="true"
                      />
                    ) : (
                      <Radio
                        size={13}
                        color={colors.inkSoft}
                        strokeWidth={3}
                        aria-hidden="true"
                      />
                    )}
                    <span className={styles.statusLabel}>{statusLabel}</span>
                  </div>
                  {updatedLabel && (
                    <span className={styles.meta}>Updated {updatedLabel}</span>
                  )}
                </div>

                <div className={styles.nowMain}>
                  {track?.imageUrl ? (
                    <img src={track.imageUrl} alt="" className={styles.nowArt} />
                  ) : track ? (
                    <div
                      className={`${styles.nowArt} ${styles.nowArtInitial} ${styles.artA}`}
                      aria-hidden="true"
                    >
                      {track.name.charAt(0)}
                    </div>
                  ) : (
                    <div
                      className={`${styles.nowArt} ${styles.nowArtInitial}`}
                      aria-hidden="true"
                    >
                      <Disc3 size={32} color={colors.inkSoft} />
                    </div>
                  )}

                  <div className={styles.nowText}>
                    <div className={styles.nowTitle}>
                      {track ? track.name : 'Nothing playing right now'}
                    </div>
                    <div className={styles.nowMeta}>
                      {track
                        ? [track.artist, track.album].filter(Boolean).join(' · ')
                        : 'Play a track on Spotify to see live playback'}
                    </div>
                  </div>
                </div>

                {track && durationMs > 0 && (
                  <div className={styles.nowProgress}>
                    <span className={styles.progressTime}>{formatTime(progressMs)}</span>
                    <div
                      className={styles.progressTrack}
                      role="progressbar"
                      aria-label="Track progress"
                      aria-valuemin={0}
                      aria-valuemax={durationMs}
                      aria-valuenow={Math.round(progressMs)}
                      aria-valuetext={`${formatTime(progressMs)} of ${formatTime(durationMs)}`}
                    >
                      <div
                        className={styles.progressFill}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className={styles.progressTime}>{formatTime(durationMs)}</span>
                  </div>
                )}

                <p className={styles.srOnly} aria-live="polite">
                  {announcement}
                </p>
              </section>

              <section
                className={`${styles.card} ${styles.listTile}`}
                aria-labelledby="top-artists-heading"
              >
                <div className={styles.listHead}>
                  <span className={styles.chip} aria-hidden="true">
                    <Mic2 size={14} />
                  </span>
                  <h2 id="top-artists-heading" className={styles.listTitle}>
                    Artists
                  </h2>
                  <span className={styles.meta}>Top {data.artists.length}</span>
                </div>

                {data.artists.length === 0 ? (
                  <p className={shared.emptyMessage}>No artist data yet.</p>
                ) : (
                  <ol className={styles.rows}>
                    {data.artists.map((artist, index) => {
                      const rank = artist.rank ?? index + 1;
                      return (
                        <li
                          key={artist.spotifyId || artist.id || index}
                          className={styles.row}
                        >
                          <span className={styles.rank} aria-hidden="true">
                            {rank}
                          </span>

                          {artist.imageUrl ? (
                            <img
                              className={`${styles.avatar} ${styles.avatarArtist}`}
                              src={artist.imageUrl}
                              alt=""
                            />
                          ) : (
                            <span
                              className={`${styles.avatarPlaceholder} ${
                                styles.avatarArtist
                              } ${artGradients[index % 3]}`}
                              aria-hidden="true"
                            >
                              {artist.name.charAt(0)}
                            </span>
                          )}

                          <span className={styles.rowInfo}>
                            <span className={styles.rowName} title={artist.name}>
                              {artist.name}
                            </span>
                            <span className={styles.rowSub}>
                              {artist.genres?.slice(0, 2).join(', ') || 'Artist'}
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </section>

              <section
                className={`${styles.card} ${styles.listTile}`}
                aria-labelledby="top-tracks-heading"
              >
                <div className={styles.listHead}>
                  <span className={styles.chip} aria-hidden="true">
                    <Music size={14} />
                  </span>
                  <h2 id="top-tracks-heading" className={styles.listTitle}>
                    Tracks
                  </h2>
                  <span className={styles.meta}>Top {data.tracks.length}</span>
                </div>

                {data.tracks.length === 0 ? (
                  <p className={shared.emptyMessage}>No track data yet.</p>
                ) : (
                  <ol className={styles.rows}>
                    {data.tracks.map((topTrack, index) => {
                      const rank = topTrack.rank ?? index + 1;
                      return (
                        <li
                          key={topTrack.spotifyId || topTrack.id || index}
                          className={styles.row}
                        >
                          <span className={styles.rank} aria-hidden="true">
                            {rank}
                          </span>

                          {topTrack.imageUrl ? (
                            <img
                              className={`${styles.avatar} ${styles.avatarTrack}`}
                              src={topTrack.imageUrl}
                              alt=""
                            />
                          ) : (
                            <span
                              className={`${styles.avatarPlaceholder} ${
                                styles.avatarTrack
                              } ${artGradients[(index + 1) % 3]}`}
                              aria-hidden="true"
                            >
                              {topTrack.name.charAt(0)}
                            </span>
                          )}

                          <span className={styles.rowInfo}>
                            <span className={styles.rowName} title={topTrack.name}>
                              {topTrack.name}
                            </span>
                            <span className={styles.rowSub}>{topTrack.artist}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </section>
            </div>
          )}
      </main>
    </div>
  );
}
