import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import LogoutButton from '../components/LogoutButton';
import { colors } from '../theme';
import shared from '../styles/StatsShared.module.css';
import styles from '../styles/TopGenres.module.css';

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

function GenrePills({ artists }: { artists: string[] }) {
    if (!artists || artists.length === 0) {
        return <span className={styles.genrePillEmpty}>No artists listed</span>;
    }
    return (
        <div className={styles.genrePills}>
            {artists.slice(0, 3).map((artist, i) => (
                <span
                    key={artist}
                    className={styles.genrePill}
                    style={{ backgroundColor: `${barPalette[i % barPalette.length]}55` }}
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
        let ignore = false;

        setLoading(true);
        setError(null);
        setBarsAnimated(false);

        fetch(`http://localhost:5000/api/genres?timeRange=${selectedTimeRange}`, { credentials: 'include' })
            .then((res) => {
                if (res.status === 401) {
                    window.location.href = '/login';
                    return;
                }
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
        <div className={`${shared.pageBg} ${shared.shell}`}>
            <LogoutButton />
            <Sidebar />
            <main className={shared.main}>
                <section className={shared.section}>
                    <div className={shared.header}>
                        <div className={shared.eyebrowRow}>
                            <span className={shared.eyebrowDot} />
                            <span className={shared.eyebrow}>Listening Activity</span>
                        </div>

                        <h2 className={shared.title}>
                            Top{' '}
                            <span className={shared.titleHighlight}>
                                <span className={shared.titleHighlightBackdrop} />
                                <span className={shared.titleHighlightText}>Genres</span>
                            </span>
                        </h2>

                        <p className={shared.subtitle}>{subtitles[selectedTimeRange]}</p>

                        <div className={shared.tabBar}>
                            {timeRangeOptions.map((option) => {
                                const isActive = selectedTimeRange === option.id;
                                return (
                                    <button
                                        key={option.id}
                                        className={`${shared.tab} ${isActive ? shared.tabActive : ''}`}
                                        onClick={() => setSelectedTimeRange(option.id)}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {loading && (
                        <div className={shared.skeletonList}>
                            {[0, 1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className={`${shared.skeletonShimmer} ${shared.skeletonItem}`}
                                    style={{ opacity: 1 - i * 0.12 }}
                                />
                            ))}
                        </div>
                    )}

                    {error && !loading && (
                        <p className={`${shared.error} ${shared.errorMessage}`}>{error}</p>
                    )}

                    {!loading && !error && genres.length === 0 && (
                        <p className={shared.emptyMessage}>No genre data found.</p>
                    )}

                    {!loading && !error && genres.length > 0 && (
                        <div className={styles.chart}>
                            {genres.map((genre, i) => {
                                const barColor = barPalette[i % barPalette.length];
                                return (
                                    <div
                                        key={genre.genre}
                                        className={styles.genreRow}
                                        style={{ animationDelay: `${i * 40}ms` }}
                                    >
                                        <div className={styles.genreHeader}>
                                            <div className={styles.rankBadge}>{i + 1}</div>

                                            <div className={styles.genreNameRow}>
                                                <span className={styles.genreName}>{genre.genre}</span>
                                                <span className={styles.genrePercentage}>
                                                    {genre.percentage}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className={styles.barTrack}>
                                            <div
                                                className={styles.barFill}
                                                style={{
                                                    width: barsAnimated
                                                        ? `${genre.percentage}%`
                                                        : '0%',
                                                    backgroundColor: barColor,
                                                    transitionDelay: `${i * 60}ms`,
                                                }}
                                            />
                                        </div>

                                        <div className={styles.barMeta}>
                                            <span className={styles.barCount}>
                                                {genre.count} artist{genre.count === 1 ? '' : 's'}{' '}
                                                {'\u00b7'}
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
