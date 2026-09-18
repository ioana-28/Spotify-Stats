import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Mic2, Music, Star, Disc3, Radio } from 'lucide-react';
import { colors, fontDisplay, stickerShadow } from '../theme';
import LogoutButton from '../components/LogoutButton';
import { injectStatsStylesOnce } from '../assets/StatsShared';

const dashboardStyleSheetId = 'dashboard-animations';
function injectDashboardStylesOnce() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(dashboardStyleSheetId)) return;
    const style = document.createElement('style');
    style.id = dashboardStyleSheetId;
    style.textContent = `
        @keyframes dash-card-in {
            from { opacity: 0; transform: translateY(14px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dash-eq-bounce {
            0%, 100% { transform: scaleY(0.35); }
            50% { transform: scaleY(1); }
        }
        @keyframes dash-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.35; }
        }
        .dash-card {
            animation: dash-card-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
            transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s ease;
        }
        .dash-card:hover { transform: translate(-2px, -2px); box-shadow: ${stickerShadow(6)}; }
        .dash-eq-bar {
            width: 4px;
            height: 16px;
            border-radius: 999;
            background-color: ${colors.mint};
            transform-origin: bottom;
            animation: dash-eq-bounce 0.9s ease-in-out infinite;
        }
        .dash-live-dot { animation: dash-pulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
            .dash-card, .dash-eq-bar, .dash-live-dot {
                animation: none !important;
                transition: none !important;
            }
        }
    `;
    document.head.appendChild(style);
}


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

interface CurrentlyPlaying {
  isPlaying: boolean;
  track: {
    id: string;
    name: string;
    artist: string;
    album: string;
    imageUrl: string | null;
  } | null;
}

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData>({ artists: [], tracks: [] });  
    const [error, setError] = useState<string | null>(null);  
    const [currentlyPlaying, setCurrentlyPlaying] = useState<CurrentlyPlaying | null>(null);

    useEffect(() => {
        injectStatsStylesOnce();
        injectDashboardStylesOnce();
    }, []);

    useEffect(() => {
        fetch('http://localhost:5000/api/dashboard', { credentials: 'include' })
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
        fetch('http://localhost:5000/api/dashboard/currently-playing', { credentials: 'include' })
          .then((res) => {
            if (!res.ok) return null;
            return res.json();
          })
          .then((data) => {
            if (data) setCurrentlyPlaying(data);
          })
          .catch(() => {});
      };
      fetchCurrentlyPlaying();
      const interval = setInterval(fetchCurrentlyPlaying, 10000);
      return () => clearInterval(interval);
    }, []);


    return (
      <>
    <LogoutButton />
    <div className="stats-page-bg" style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.ink }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '36px 40px', boxSizing: 'border-box', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ color: colors.paper, fontFamily: fontDisplay, fontSize: 32, fontWeight: 700, margin: 0 }}>
            Dashboard
          </h1>
        </div>

        <section
  className="dash-card"
  style={{
    backgroundColor: colors.panel,
    border: `2.5px solid ${colors.ink}`,
    borderRadius: 20,
    padding: '18px 24px',
    boxShadow: stickerShadow(4),
    marginBottom: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  }}
>
  <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
    {currentlyPlaying?.isPlaying && currentlyPlaying.track?.imageUrl ? (
      <img
        src={currentlyPlaying.track.imageUrl}
        alt={currentlyPlaying.track.name}
        style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          border: `2px solid ${colors.ink}`,
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    ) : (
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          backgroundColor: colors.paper,
          border: `2px solid ${colors.ink}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Disc3 size={28} color={colors.inkSoft} />
      </div>
    )}

    <div style={{ minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
        {currentlyPlaying?.isPlaying ? (
          <>
            <span
              className="dash-live-dot"
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: colors.mint,
                border: `1.5px solid ${colors.ink}`,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                marginRight: 2,
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="dash-eq-bar"
                  style={{ animationDelay: `${i * 0.18}s` }}
                />
              ))}
            </span>
          </>
        ) : (
          <Radio size={14} color={colors.inkSoft} strokeWidth={3} />
        )}
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 1,
            color: colors.inkSoft,
          }}
        >
          {currentlyPlaying?.isPlaying ? 'Now Playing' : 'Spotify Paused / Idle'}
        </span>
      </div>

      <div
        style={{
          fontFamily: fontDisplay,
          fontSize: 16,
          fontWeight: 700,
          color: colors.ink,
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
        }}
      >
        {currentlyPlaying?.isPlaying && currentlyPlaying.track
          ? currentlyPlaying.track.name
          : 'Nothing playing right now'}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: colors.inkSoft,
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
        }}
      >
        {currentlyPlaying?.isPlaying && currentlyPlaying.track
          ? `${currentlyPlaying.track.artist} \u00b7 ${currentlyPlaying.track.album}`
          : 'Play a track on Spotify to see live playback'}
      </div>
    </div>
  </div>
</section>
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 24 }}>
            {[0, 1].map((i) => (
              <section
                key={i}
                style={{
                  backgroundColor: colors.panel,
                  border: `2.5px solid ${colors.ink}`,
                  borderRadius: 20,
                  padding: 24,
                  boxShadow: stickerShadow(4),
                }}
              >
                <div
                  className="stats-skeleton"
                  style={{ height: 24, width: 140, borderRadius: 8, marginBottom: 20 }}
                />
                {[0, 1, 2].map((r) => (
                  <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div className="stats-skeleton" style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0 }} />
                    <div className="stats-skeleton" style={{ width: 44, height: 44, borderRadius: 8, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="stats-skeleton" style={{ height: 15, width: '70%', borderRadius: 6, marginBottom: 8 }} />
                      <div className="stats-skeleton" style={{ height: 12, width: '45%', borderRadius: 6 }} />
                    </div>
                  </div>
                ))}
              </section>
            ))}
          </div>
        )}
        {error && <p className="stats-error" style={{ color: colors.coral, fontWeight: 700 }}>Error: {error}</p>}

        {!loading && !error && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 24 }}>
            
            <section
              className="dash-card"
              style={{
                backgroundColor: colors.panel,
                border: `2.5px solid ${colors.ink}`,
                borderRadius: 20,
                padding: '24px',
                boxShadow: stickerShadow(4),
                animationDelay: '60ms',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      backgroundColor: colors.mint,
                      border: `2px solid ${colors.ink}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Mic2 size={16} color={colors.ink} strokeWidth={2.5} />
                  </div>
                  <h2 style={{ color: colors.ink, fontFamily: fontDisplay, fontSize: 20, fontWeight: 600, margin: 0 }}>
                    Top Artists
                  </h2>
                </div>
                <span style={{ color: colors.inkSoft, fontSize: 13, fontWeight: 700 }}>Past Month</span>
              </div>

              {data.artists.length === 0 ? (
                <p style={{ color: colors.inkSoft, fontSize: 14 }}>No artist data found.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {data.artists.map((artist, index) => (
                    <div
                      key={artist.spotifyId || artist.id || index}
                      className="stats-row"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 14px',
                        borderRadius: 14,
                        border: `2px solid ${colors.ink}`,
                        backgroundColor: colors.paper,
                        animationDelay: `${index * 40}ms`,
                      }}
                    >
                      <div
                        className="stats-rank-badge"
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          border: `2px solid ${colors.ink}`,
                          backgroundColor: index === 0 ? colors.sunflower : colors.panel,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontFamily: fontDisplay,
                          fontWeight: 700,
                          fontSize: 14,
                          color: colors.ink,
                        }}
                      >
                        <Star size={15} fill={colors.ink} strokeWidth={0} />
                      </div>

                      {artist.imageUrl ? (
                        <img
                          className="stats-avatar-img"
                          src={artist.imageUrl}
                          alt={artist.name}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: `2px solid ${colors.ink}`,
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            border: `2px solid ${colors.ink}`,
                            backgroundColor: colors.mint,
                            flexShrink: 0,
                          }}
                        />
                      )}

                      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                        <div
                          style={{
                            color: colors.ink,
                            fontFamily: fontDisplay,
                            fontSize: 15,
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                          }}
                        >
                          {artist.name}
                        </div>
                        <div
                          style={{
                            color: colors.inkSoft,
                            fontSize: 12,
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                          }}
                        >
                          {artist.genres?.slice(0, 2).join(', ') || 'Artist'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section
              className="dash-card"
              style={{
                backgroundColor: colors.panel,
                border: `2.5px solid ${colors.ink}`,
                borderRadius: 20,
                padding: '24px',
                boxShadow: stickerShadow(4),
                animationDelay: '140ms',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      backgroundColor: colors.coral,
                      border: `2px solid ${colors.ink}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Music size={16} color={colors.ink} strokeWidth={2.5} />
                  </div>
                  <h2 style={{ color: colors.ink, fontFamily: fontDisplay, fontSize: 20, fontWeight: 600, margin: 0 }}>
                    Top Tracks
                  </h2>
                </div>
                <span style={{ color: colors.inkSoft, fontSize: 13, fontWeight: 700 }}>Past Month</span>
              </div>

              {data.tracks.length === 0 ? (
                <p style={{ color: colors.inkSoft, fontSize: 14 }}>No track data found.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {data.tracks.map((track, index) => (
                    <div
                      key={track.spotifyId || track.id || index}
                      className="stats-row"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 14px',
                        borderRadius: 14,
                        border: `2px solid ${colors.ink}`,
                        backgroundColor: colors.paper,
                        animationDelay: `${index * 40}ms`,
                      }}
                    >
                      {/* Rank Star Badge */}
                      <div
                        className="stats-rank-badge"
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          border: `2px solid ${colors.ink}`,
                          backgroundColor: index === 0 ? colors.sunflower : colors.panel,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontFamily: fontDisplay,
                          fontWeight: 700,
                          fontSize: 14,
                          color: colors.ink,
                        }}
                      >
                        <Star size={15} fill={colors.ink} strokeWidth={0} />
                      </div>

                      {track.imageUrl ? (
                        <img
                          className="stats-avatar-img"
                          src={track.imageUrl}
                          alt={track.name}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 8,
                            objectFit: 'cover',
                            border: `2px solid ${colors.ink}`,
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 8,
                            border: `2px solid ${colors.ink}`,
                            backgroundColor: colors.coral,
                            flexShrink: 0,
                          }}
                        />
                      )}

                      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                        <div
                          style={{
                            color: colors.ink,
                            fontFamily: fontDisplay,
                            fontSize: 15,
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                          }}
                        >
                          {track.name}
                        </div>
                        <div
                          style={{
                            color: colors.inkSoft,
                            fontSize: 12,
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                          }}
                        >
                          {track.artist}
                        </div>
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