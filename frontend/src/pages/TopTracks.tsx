import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Star } from 'lucide-react';
import { colors, fontDisplay, stickerShadow } from '../theme';

export default function TopTracks() {
    const [loading, setLoading] = useState(false);
    const [tracks, setTracks] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        fetch('http://localhost:5000/api/top-tracks')
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
    }, []);

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{ flex: 1, padding: '36px 40px', boxSizing: 'border-box', maxWidth: 920, margin: '0 auto' }}>
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
            </main>
        </div>
    );
}
