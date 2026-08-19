import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Mic2, Music, Star } from 'lucide-react';
import { colors, fontDisplay, stickerShadow } from '../theme';



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

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData>({ artists: [], tracks: [] });  
    const [error, setError] = useState<string | null>(null);  

    useEffect(() => {
        fetch('http://localhost:5000/api/dashboard')
            .then((res) => {
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


    return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.ink }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '36px 40px', boxSizing: 'border-box', maxWidth: 960, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ color: colors.ink, fontFamily: fontDisplay, fontSize: 32, fontWeight: 700, margin: 0 }}>
            Dashboard
          </h1>
        </div>

        {loading && <p style={{ color: colors.inkSoft, fontWeight: 700 }}>Loading your monthly highlights...</p>}
        {error && <p style={{ color: colors.coral, fontWeight: 700 }}>Error: {error}</p>}

        {!loading && !error && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 24 }}>
           
            <section
              style={{
                backgroundColor: colors.panel,
                border: `2.5px solid ${colors.ink}`,
                borderRadius: 20,
                padding: '24px',
                boxShadow: stickerShadow(4),
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
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 14px',
                        borderRadius: 14,
                        border: `2px solid ${colors.ink}`,
                        backgroundColor: colors.paper,
                      }}
                    >
                      {/* Rank Star Badge */}
                      <div
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
              style={{
                backgroundColor: colors.panel,
                border: `2.5px solid ${colors.ink}`,
                borderRadius: 20,
                padding: '24px',
                boxShadow: stickerShadow(4),
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
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 14px',
                        borderRadius: 14,
                        border: `2px solid ${colors.ink}`,
                        backgroundColor: colors.paper,
                      }}
                    >
                      {/* Rank Star Badge */}
                      <div
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
  );
}