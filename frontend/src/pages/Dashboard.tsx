import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Mic2, Music, Star, Disc3, Radio, Pause } from 'lucide-react';
import { colors } from '../theme';
import LogoutButton from '../components/LogoutButton';
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
            .then((data: DashboardData) => {
                setData(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
      const fetchCurrentlyPlaying = () => {
        fetch('http://127.0.0.1:5000/api/dashboard/currently-playing', { credentials: 'include' })
          .then((res) => {
            if (!res.ok) return null;
            return res.json();
          })
          .then((data: CurrentlyPlayingResponse | null) => {
            if (data) {
              setCurrentlyPlaying({ ...data, fetchedAt: Date.now() });
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
    const statusLabel = !hasTrack
      ? 'Idle'
      : currentlyPlaying?.isPlaying
        ? 'Now Playing'
        : 'Paused';


    return (
      <>
    <LogoutButton />
    <div className={`${shared.pageBg} ${styles.page}`}>
      <Sidebar />

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
        </div>

        <section className={styles.nowPlaying}>
          <div className={styles.nowPlayingInner}>
            {track?.imageUrl ? (
              <img
                src={track.imageUrl}
                alt={track.name}
                className={styles.nowPlayingArt}
              />
            ) : (
              <div className={styles.nowPlayingArtPlaceholder}>
                <Disc3 size={28} color={colors.inkSoft} />
              </div>
            )}

            <div className={styles.nowPlayingInfo}>
              <div className={styles.statusRow}>
                {currentlyPlaying?.isPlaying ? (
                  <>
                    <span className={styles.liveDot} />
                    <span className={styles.eq}>
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className={styles.eqBar}
                          style={{ animationDelay: `${i * 0.18}s` }}
                        />
                      ))}
                    </span>
                  </>
                ) : hasTrack ? (
                  <Pause size={14} color={colors.inkSoft} strokeWidth={3} />
                ) : (
                  <Radio size={14} color={colors.inkSoft} strokeWidth={3} />
                )}
                <span className={styles.statusLabel}>{statusLabel}</span>
              </div>

              <div className={styles.trackName}>
                {track ? track.name : 'Nothing playing right now'}
              </div>
              <div className={styles.trackMeta}>
                {track
                  ? [track.artist, track.album].filter(Boolean).join(' \u00b7 ')
                  : 'Play a track on Spotify to see live playback'}
              </div>

              {track && durationMs > 0 && (
                <div className={styles.progressRow}>
                  <span className={styles.progressTime}>{formatTime(progressMs)}</span>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className={styles.progressTime}>{formatTime(durationMs)}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {loading && (
          <div className={styles.grid}>
            {[0, 1].map((i) => (
              <section key={i} className={styles.skeletonPanel}>
                <div className={`${shared.skeletonShimmer} ${styles.skeletonTitle}`} />
                {[0, 1, 2].map((r) => (
                  <div key={r} className={styles.skeletonRow}>
                    <div className={`${shared.skeletonShimmer} ${styles.skeletonRank}`} />
                    <div className={`${shared.skeletonShimmer} ${styles.skeletonAvatar}`} />
                    <div className={styles.skeletonInfo}>
                      <div className={`${shared.skeletonShimmer} ${styles.skeletonName}`} />
                      <div className={`${shared.skeletonShimmer} ${styles.skeletonSub}`} />
                    </div>
                  </div>
                ))}
              </section>
            ))}
          </div>
        )}
        {error && <p className={`${shared.error} ${styles.dashError}`}>Error: {error}</p>}

        {!loading && !error && (
          <div className={styles.grid}>
            
            <section className={styles.panel} style={{ animationDelay: '60ms' }}>
              <div className={styles.panelHeader}>
                <div className={styles.panelTitleRow}>
                  <div
                    className={styles.panelIcon}
                    style={{ backgroundColor: colors.mint }}
                  >
                    <Mic2 size={16} color={colors.ink} strokeWidth={2.5} />
                  </div>
                  <h2 className={styles.panelTitle}>Top Artists</h2>
                </div>
                <span className={styles.panelRange}>Past Month</span>
              </div>

              {data.artists.length === 0 ? (
                <p className={shared.emptyMessage}>No artist data found.</p>
              ) : (
                <div className={styles.list}>
                  {data.artists.map((artist, index) => (
                    <div
                      key={artist.spotifyId || artist.id || index}
                      className={styles.dashRow}
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <div
                        className={styles.dashRankBadge}
                        style={{
                          backgroundColor:
                            index === 0 ? colors.sunflower : colors.panel,
                        }}
                      >
                        <Star size={15} fill={colors.ink} strokeWidth={0} />
                      </div>

                      {artist.imageUrl ? (
                        <img
                          className={`${styles.dashAvatar} ${styles.dashAvatarArtist}`}
                          src={artist.imageUrl}
                          alt={artist.name}
                        />
                      ) : (
                        <div
                          className={`${styles.dashAvatarPlaceholder} ${styles.dashAvatarPlaceholderArtist}`}
                        />
                      )}

                      <div className={styles.rowInfo}>
                        <div className={styles.rowName}>{artist.name}</div>
                        <div className={styles.rowSub}>
                          {artist.genres?.slice(0, 2).join(', ') || 'Artist'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className={styles.panel} style={{ animationDelay: '140ms' }}>
              <div className={styles.panelHeader}>
                <div className={styles.panelTitleRow}>
                  <div
                    className={styles.panelIcon}
                    style={{ backgroundColor: colors.coral }}
                  >
                    <Music size={16} color={colors.ink} strokeWidth={2.5} />
                  </div>
                  <h2 className={styles.panelTitle}>Top Tracks</h2>
                </div>
                <span className={styles.panelRange}>Past Month</span>
              </div>

              {data.tracks.length === 0 ? (
                <p className={shared.emptyMessage}>No track data found.</p>
              ) : (
                <div className={styles.list}>
                  {data.tracks.map((track, index) => (
                    <div
                      key={track.spotifyId || track.id || index}
                      className={styles.dashRow}
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <div
                        className={styles.dashRankBadge}
                        style={{
                          backgroundColor:
                            index === 0 ? colors.sunflower : colors.panel,
                        }}
                      >
                        <Star size={15} fill={colors.ink} strokeWidth={0} />
                      </div>

                      {track.imageUrl ? (
                        <img
                          className={`${styles.dashAvatar} ${styles.dashAvatarTrack}`}
                          src={track.imageUrl}
                          alt={track.name}
                        />
                      ) : (
                        <div
                          className={`${styles.dashAvatarPlaceholder} ${styles.dashAvatarPlaceholderTrack}`}
                        />
                      )}

                      <div className={styles.rowInfo}>
                        <div className={styles.rowName}>{track.name}</div>
                        <div className={styles.rowSub}>{track.artist}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
    </>
  );
}
