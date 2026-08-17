import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Star } from 'lucide-react';
import { colors, fontDisplay, stickerShadow } from '../theme';

type TimeRange = 'short_term' | 'medium_term' | 'long_term';

interface Artist {
  id?: string;
  spotifyId: string;
  name: string;
  genres: string[];
  imageUrl: string | null;
  rank: number;
}

const timeRangeOptions: { id: TimeRange; label: string }[] = [
    { id: 'short_term', label: 'Past Month' },
    { id: 'medium_term', label: 'Past 6 Months' },
    { id: 'long_term', label: 'All Time' },
];

export default function TopArtists() {
    const [loading, setLoading] = useState(true);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('short_term');

    useEffect(() => {
        let ignore = false;

        Promise.resolve().then(() => {
            if (!ignore) setLoading(true);
        });

        fetch(`http://localhost:5000/api/top-artists?timeRange=${selectedTimeRange}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch stats');
                return res.json();
            })
            .then((data: { items: Artist[] }) => {
                if (ignore) return;
                setArtists(data.items);
                setError(null);
            })
            .catch((err) => {
                if (!ignore) setError(err.message);
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, [selectedTimeRange]);

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
                            Top Artists
                        </h2>
                        <span style={{ color: colors.inkSoft, fontSize: 14, fontWeight: 700 }}>
                            Fetched from Spotify API
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                        {timeRangeOptions.map((option) => {
                            const isActive = selectedTimeRange === option.id;
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => setSelectedTimeRange(option.id)}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: 12,
                                        border: `2px solid ${colors.ink}`,
                                        backgroundColor: isActive ? colors.sunflower : colors.paper,
                                        color: colors.ink,
                                        fontFamily: fontDisplay,
                                        fontWeight: 600,
                                        fontSize: 14,
                                        cursor: 'pointer',
                                        boxShadow: isActive ? stickerShadow(2) : 'none',
                                        transform: isActive ? 'translate(-1px, -1px)' : 'none',
                                        transition: 'all 0.1s ease',
                                    }}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
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
            </main>
        </div>
    );
}
