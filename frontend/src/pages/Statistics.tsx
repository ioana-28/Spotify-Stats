import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Star } from 'lucide-react';

const colors = {
  paper: '#FFF6E9',
  panel: '#FFFFFF',
  ink: '#221F1A',
  inkSoft: '#6E685C',
  coral: '#FF6F5E',
  sunflower: '#FFC845',
  mint: '#3ED9A5',
  grape: '#A184E8',
  sky: '#5BB8F0',
};

const fontDisplay = "'Fredoka', ui-rounded, 'Segoe UI', sans-serif";
const fontBody = "'Nunito', ui-rounded, 'Segoe UI', sans-serif";

const stickerShadow = (offset = 4) => `${offset}px ${offset}px 0px ${colors.ink}`;

export default function Statistics() {
    const [activeTab, setActiveTab] = useState<'artists' | 'tracks' | 'genres'>('artists');
    const [loading, setLoading] = useState(false);
    const [artists, setArtists] = useState<any[]>([]);
    const [tracks, setTracks] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (activeTab === 'artists') {
            setLoading(true);
            fetch('http://localhost:5000/api/stats/top-artists')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch stats');
                return res.json();
            })
            .then((data) => {
                setArtists(data.items);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
        }

        if (activeTab === 'tracks') {
            setLoading(true);
            fetch('http://localhost:5000/api/stats/top-tracks')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch stats');
                return res.json();
            })
            .then((data) => {
                setTracks(data.items);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
        }

    }, [activeTab]);
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{ flex: 1, padding: '36px 40px', boxSizing: 'border-box', maxWidth: 920, margin: '0 auto' }}>

                <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                    {[
                        { id: 'artists', label: 'Top Artists' },
                        { id: 'tracks', label: 'Top Tracks' },
                        { id: 'genres', label: 'Genres' },
                    ].map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: 14,
                                    border: `2.5px solid ${colors.ink}`,
                                    backgroundColor: isActive ? colors.sunflower : colors.panel,
                                    color: colors.ink,
                                    fontFamily: fontDisplay,
                                    fontWeight: 600,
                                    fontSize: 15,
                                    cursor: 'pointer',
                                    boxShadow: isActive ? stickerShadow(3) : 'none',
                                    transform: isActive ? 'translate(-1px, -1px)' : 'none',
                                    transition: 'all 0.1s ease',
                                }}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
                
                {activeTab === 'artists' && (
                    <section style={{
                        backgroundColor: colors.panel,
                        border: `2.5px solid ${colors.ink}`,
                        borderRadius: 20,
                        padding: 24,
                        boxShadow: stickerShadow(4),
                    }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 24,
                        }}>
                            <h2 style={{ color: colors.ink, fontFamily: fontDisplay, fontSize: 22, fontWeight: 600, margin: 0 }}>
                                Top Artists
                            </h2>
                            <span style={{ color: colors.inkSoft, fontSize: 14, fontWeight: 700 }}>
                                Fetched from Spotify API
                            </span>
                        </div>

                        {loading && <p style={{ color: colors.inkSoft, fontSize: 14 }}>Loading...</p>}
                        {error && <p style={{ color: colors.coral, fontSize: 14 }}>{error}</p>}
                        {!loading && !error && artists.length === 0 && (
                            <p style={{ color: colors.inkSoft, fontSize: 14 }}>No artists found.</p>
                        )}

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                        }}>
                            {artists.map((artist, i) => (
                                <div
                                    key={artist.id || artist.rank}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: '10px 15px',
                                        borderRadius: 12,
                                        border: `2.5px solid ${colors.ink}`,
                                        backgroundColor: colors.paper,
                                    }}
                                >
                                    <div style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: '50%',
                                        border: `2.5px solid ${colors.ink}`,
                                        backgroundColor: i < 3 ? colors.sunflower : colors.panel,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: colors.ink,
                                        fontFamily: fontDisplay,
                                        fontWeight: 600,
                                    }}>
                                        {i < 3 ? <Star size={14} fill={colors.ink} strokeWidth={0} /> : i + 1}
                                    </div>

                                    {artist.imageUrl ? (
                                        <img
                                            src={artist.imageUrl}
                                            alt={artist.name}
                                            style={{
                                                width: 50,
                                                height: 50,
                                                borderRadius: '50%',
                                                border: `2.5px solid ${colors.ink}`,
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: '50%',
                                            border: `2.5px solid ${colors.ink}`,
                                            backgroundColor: colors.panel,
                                        }} />
                                    )}

                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ color: colors.ink, fontFamily: fontDisplay, fontSize: 16, fontWeight: 600 }}>
                                            {artist.name}
                                        </div>
                                        <div style={{ color: colors.inkSoft, fontSize: 14, fontWeight: 700 }}>
                                            {artist.genres?.slice(0, 2).join(', ') || 'Various Genres'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {activeTab === 'tracks' && (
                    <section style={{
                        backgroundColor: colors.panel,
                        border: `2.5px solid ${colors.ink}`,
                        borderRadius: 20,
                        padding: 24,
                        boxShadow: stickerShadow(4),
                    }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 24,
                        }}>
                            <h2 style={{ color: colors.ink, fontFamily: fontDisplay, fontSize: 22, fontWeight: 600, margin: 0 }}>
                                Top Tracks
                            </h2>
                            <span style={{ color: colors.inkSoft, fontSize: 14, fontWeight: 700 }}>
                                Fetched from Spotify API
                            </span>
                        </div>

                        {loading && <p style={{ color: colors.inkSoft, fontSize: 14 }}>Loading...</p>}
                        {error && <p style={{ color: colors.coral, fontSize: 14 }}>{error}</p>}
                        {!loading && !error && tracks.length === 0 && (
                            <p style={{ color: colors.inkSoft, fontSize: 14 }}>No tracks found.</p>
                        )}

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                        }}>
                            {tracks.map((track, i) => (
                                <div
                                    key={track.id || track.rank}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: '10px 15px',
                                        borderRadius: 12,
                                        border: `2.5px solid ${colors.ink}`,
                                        backgroundColor: colors.paper,
                                    }}
                                >
                                    <div style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: '50%',
                                        border: `2.5px solid ${colors.ink}`,
                                        backgroundColor: i < 3 ? colors.sunflower : colors.panel,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: colors.ink,
                                        fontFamily: fontDisplay,
                                        fontWeight: 600,
                                    }}>
                                        {i < 3 ? <Star size={14} fill={colors.ink} strokeWidth={0} /> : i + 1}
                                    </div>

                                    {track.imageUrl ? (
                                        <img
                                            src={track.imageUrl}
                                            alt={track.name}
                                            style={{
                                                width: 50,
                                                height: 50,
                                                borderRadius: '50%',
                                                border: `2.5px solid ${colors.ink}`,
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: '50%',
                                            border: `2.5px solid ${colors.ink}`,
                                            backgroundColor: colors.panel,
                                        }} />
                                    )}

                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ color: colors.ink, fontFamily: fontDisplay, fontSize: 16, fontWeight: 600 }}>
                                            {track.name}
                                        </div>
                                        <div style={{ color: colors.inkSoft, fontSize: 14, fontWeight: 700 }}>
                                            {track.artist} {track.album ? `- ${track.album}` : ''}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}