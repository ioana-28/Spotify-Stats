import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { colors, fontDisplay, fontBody, stickerShadow } from '../theme';

type TimeRange = 'short_term' | 'medium_term' | 'long_term';

interface GenreStat {
    genre: string;
    score: number;
    percentage: number;
    count: number;
    topArtists: string[];
}

const timeRangeOptions: { id: TimeRange; label: string }[] = [
    { id: 'short_term', label: 'Past Month' },
    { id: 'medium_term', label: 'Past 6 Months' },
    { id: 'long_term', label: 'All Time' },
];

const subtitles: Record<TimeRange, string> = {
    short_term: "what's been on repeat, by genre",
    medium_term: 'your genre mix this season',
    long_term: 'the genres that define your library',
};

const barPalette = [colors.coral, colors.sky, colors.mint, colors.grape, colors.sunflower];

const styleSheetId = 'top-genres-animations';
function injectStylesOnce() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(styleSheetId)) return;
    const style = document.createElement('style');
    style.id = styleSheetId;
    style.textContent = `
        @keyframes tg-row-in {
            from { opacity: 0; transform: translateY(10px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes tg-shimmer {
            0% { background-position: -400px 0; }
            100% { background-position: 400px 0; }
        }
        @keyframes tg-shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-4px); }
            40% { transform: translateX(4px); }
            60% { transform: translateX(-3px); }
            80% { transform: translateX(3px); }
        }
        .tg-page-bg {
            background-image: radial-gradient(${colors.ink}14 1.4px, transparent 1.4px);
            background-size: 18px 18px;
        }
        .tg-tab {
            transition: transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1),
                        box-shadow 0.16s ease, background-color 0.16s ease;
        }
        .tg-tab:hover { transform: translate(-1px, -1px); }
        .tg-tab:active { transform: translate(1px, 1px) scale(0.97); }
        .tg-tab:focus-visible { outline: 2.5px solid ${colors.ink}; outline-offset: 2px; }

        .tg-row {
            transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s ease;
            animation: tg-row-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .tg-row:hover { transform: translate(-2px, -2px); }
        .tg-rank-badge { transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .tg-row:hover .tg-rank-badge { transform: scale(1.1) rotate(-6deg); }

        .tg-skeleton {
            background: linear-gradient(90deg, ${colors.panel} 0%, #F3ECDD 50%, ${colors.panel} 100%);
            background-size: 800px 100%;
            animation: tg-shimmer 1.4s ease-in-out infinite;
        }
        .tg-error { animation: tg-shake 0.4s ease; }

        @media (prefers-reduced-motion: reduce) {
            .tg-row, .tg-tab, .tg-rank-badge {
                animation: none !important;
                transition: none !important;
            }
        }
    `;
    document.head.appendChild(style);
}

function GenrePills({ artists }: { artists: string[] }) {
    if (!artists || artists.length === 0) {
        return (
            <span style={{ color: colors.inkSoft, fontSize: 12, fontFamily: fontBody, fontWeight: 700 }}>
                No artists listed
            </span>
        );
    }
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {artists.slice(0, 3).map((artist, i) => (
                <span
                    key={artist}
                    style={{
                        fontFamily: fontBody,
                        fontSize: 11,
                        fontWeight: 700,
                        color: colors.ink,
                        padding: '3px 9px',
                        borderRadius: 999,
                        border: `1.5px solid ${colors.ink}`,
                        backgroundColor: `${barPalette[i % barPalette.length]}55`,
                        whiteSpace: 'nowrap',
                    }}
                >
                    {artist}
                </span>
            ))}
        </div>
    );
}

export default function TopGenres() {
    const [loading, setLoading] = useState(true);
    const [genres, setGenres] = useState<GenreStat[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('short_term');
    const [barsAnimated, setBarsAnimated] = useState(false);

    useEffect(() => {
        injectStylesOnce();
    }, []);

    useEffect(() => {
        let ignore = false;

        setLoading(true);
        setError(null);
        setBarsAnimated(false);

        fetch(`http://localhost:5000/api/genres?timeRange=${selectedTimeRange}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch stats');
                return res.json();
            })
            .then((data: { genres: GenreStat[] }) => {
                if (ignore) return;
                setGenres(data.genres);
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

    useEffect(() => {
        if (loading || error || genres.length === 0) return;
        const id = requestAnimationFrame(() => setBarsAnimated(true));
        return () => cancelAnimationFrame(id);
    }, [loading, error, genres]);

    return (
        <div className="tg-page-bg" style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.ink }}>
            <Sidebar />
            <main style={{ flex: 1, padding: '36px 40px', boxSizing: 'border-box', maxWidth: 920, margin: '0 auto' }}>
                <section style={{
                    backgroundColor: colors.panel,
                    border: `2.5px solid ${colors.ink}`,
                    borderRadius: 20,
                    padding: 28,
                    boxShadow: stickerShadow(4),
                }}>
                    {/* Header */}
                    <div style={{ marginBottom: 28 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: colors.coral }} />
                            <span style={{
                                fontFamily: fontBody,
                                fontSize: 11,
                                fontWeight: 800,
                                letterSpacing: 1.5,
                                textTransform: 'uppercase',
                                color: colors.inkSoft,
                            }}>
                                Listening Activity
                            </span>
                        </div>

                        <h2 style={{
                            color: colors.ink,
                            fontFamily: fontDisplay,
                            fontSize: 34,
                            fontWeight: 600,
                            margin: '0 0 6px 0',
                            lineHeight: 1.1,
                        }}>
                            Top{' '}
                            <span style={{ position: 'relative', display: 'inline-block' }}>
                                <span style={{
                                    position: 'absolute',
                                    inset: '4px -6px 0px -6px',
                                    backgroundColor: colors.mint,
                                    transform: 'rotate(-2deg)',
                                    borderRadius: 5,
                                    zIndex: 0,
                                }} />
                                <span style={{ position: 'relative', zIndex: 1 }}>Genres</span>
                            </span>
                        </h2>

                        <p style={{
                            margin: '0 0 20px 0',
                            fontFamily: fontBody,
                            fontSize: 14,
                            fontWeight: 700,
                            color: colors.inkSoft,
                        }}>
                            {subtitles[selectedTimeRange]}
                        </p>

                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {timeRangeOptions.map((option) => {
                                const isActive = selectedTimeRange === option.id;
                                return (
                                    <button
                                        key={option.id}
                                        className="tg-tab"
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
                                        }}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {loading && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[0, 1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="tg-skeleton"
                                    style={{
                                        height: 74,
                                        borderRadius: 12,
                                        border: `2.5px solid ${colors.ink}`,
                                        opacity: 1 - i * 0.12,
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Error */}
                    {error && !loading && (
                        <p className="tg-error" style={{ color: colors.coral, fontSize: 14, fontWeight: 700 }}>
                            {error}
                        </p>
                    )}

                    {!loading && !error && genres.length === 0 && (
                        <p style={{ color: colors.inkSoft, fontSize: 14 }}>No genre data found.</p>
                    )}

                    {/* Bar chart */}
                    {!loading && !error && genres.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {genres.map((genre, i) => {
                                const barColor = barPalette[i % barPalette.length];
                                return (
                                    <div
                                        key={genre.genre}
                                        className="tg-row"
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 8,
                                            padding: '14px 16px',
                                            borderRadius: 12,
                                            border: `2.5px solid ${colors.ink}`,
                                            backgroundColor: colors.paper,
                                            animationDelay: `${i * 40}ms`,
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div className="tg-rank-badge" style={{
                                                width: 32,
                                                height: 32,
                                                flexShrink: 0,
                                                borderRadius: '50%',
                                                border: `2.5px solid ${colors.ink}`,
                                                backgroundColor: colors.panel,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: colors.ink,
                                                fontFamily: fontDisplay,
                                                fontWeight: 600,
                                                fontSize: 13,
                                            }}>
                                                {i + 1}
                                            </div>

                                            <div style={{
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'baseline',
                                                justifyContent: 'space-between',
                                                gap: 8,
                                            }}>
                                                <span style={{
                                                    color: colors.ink,
                                                    fontFamily: fontDisplay,
                                                    fontSize: 16,
                                                    fontWeight: 600,
                                                }}>
                                                    {genre.genre}
                                                </span>
                                                <span style={{
                                                    color: colors.inkSoft,
                                                    fontFamily: fontDisplay,
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                    flexShrink: 0,
                                                }}>
                                                    {genre.percentage}%
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{
                                            height: 14,
                                            borderRadius: 999,
                                            border: `2px solid ${colors.ink}`,
                                            backgroundColor: colors.panel,
                                            overflow: 'hidden',
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                width: barsAnimated ? `${genre.percentage}%` : '0%',
                                                backgroundColor: barColor,
                                                transition: 'width 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
                                                transitionDelay: `${i * 60}ms`,
                                            }} />
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                            <span style={{ color: colors.inkSoft, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                                                {genre.count} artist{genre.count === 1 ? '' : 's'} {'\u00b7'}
                                            </span>
                                            <GenrePills artists={genre.topArtists} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
