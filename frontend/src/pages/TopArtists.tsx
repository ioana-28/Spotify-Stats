import { useEffect, useState } from 'react';
import { colors, fontBody } from '../theme';
import {
    injectStatsStylesOnce,
    timeRangeOptions,
    StatsPageShell,
    StatsHeader,
    SkeletonList,
    ErrorMessage,
    EmptyMessage,
    PodiumRow,
    StatsList,
} from '../assets/StatsShared';
import type { TimeRange, StatsItem } from '../assets/StatsShared';

const pillPalette = [colors.coral, colors.sky, colors.mint, colors.grape, colors.sunflower];

function formatGenre(genre: string) {
    return genre.replace(/\b\w/g, (char) => char.toUpperCase());
}

function Pills({ items }: { items: string[] }) {
    if (!items || items.length === 0) {
        return (
            <span
                style={{
                    fontFamily: fontBody,
                    fontSize: 11,
                    fontWeight: 700,
                    color: colors.inkSoft,
                    padding: '3px 9px',
                    borderRadius: 999,
                    border: `1.5px dashed ${colors.inkSoft}`,
                    whiteSpace: 'nowrap',
                }}
            >
                No genres listed
            </span>
        );
    }

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'inherit' }}>
            {items.slice(0, 2).map((item, i) => (
                <span
                    key={item}
                    style={{
                        fontFamily: fontBody,
                        fontSize: 11,
                        fontWeight: 700,
                        color: colors.ink,
                        padding: '3px 9px',
                        borderRadius: 999,
                        border: `1.5px solid ${colors.ink}`,
                        backgroundColor: `${pillPalette[i % pillPalette.length]}55`,
                        whiteSpace: 'nowrap',
                    }}
                >
                    {formatGenre(item)}
                </span>
            ))}
        </div>
    );
}

interface Artist {
    id?: string;
    spotifyId: string;
    name: string;
    genres: string[];
    imageUrl: string | null;
    rank: number;
}

const subtitles: Record<TimeRange, string> = {
    short_term: 'what you\u2019ve had on repeat lately',
    medium_term: 'your season, so far',
    long_term: 'the artists who made you, you',
};

export default function TopArtists() {
    const [loading, setLoading] = useState(true);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('short_term');
    const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

    useEffect(() => {
        injectStatsStylesOnce();
    }, []);

    useEffect(() => {
        let ignore = false;

        setLoading(true);
        setError(null);

        fetch(`http://localhost:5000/api/top-artists?timeRange=${selectedTimeRange}`, { credentials: 'include' })
            .then((res) => {
                if (res.status === 401) {
                    window.location.href = '/login';
                    return;
                }
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

    const toStatsItem = (artist: Artist): StatsItem => ({
        key: artist.id || artist.rank,
        imageUrl: artist.imageUrl,
        imageAlt: artist.name,
        title: artist.name,
        subtitle: <Pills items={artist.genres} />,
        loaded: !!loadedImages[artist.spotifyId],
        onImageLoad: () => setLoadedImages((prev) => ({ ...prev, [artist.spotifyId]: true })),
    });

    const podiumItems = artists.slice(0, 3).map(toStatsItem);
    const restItems = artists.slice(3).map(toStatsItem);

    return (
        <StatsPageShell>
            <StatsHeader
                titlePrefix="Top"
                highlightWord="Artists"
                subtitle={subtitles[selectedTimeRange]}
                options={timeRangeOptions}
                selected={selectedTimeRange}
                onSelect={setSelectedTimeRange}
            />

            {loading && <SkeletonList />}
            {error && !loading && <ErrorMessage message={error} />}
            {!loading && !error && artists.length === 0 && <EmptyMessage message="No artists found." />}
            {!loading && !error && podiumItems.length > 0 && <PodiumRow items={podiumItems} />}
            {!loading && !error && restItems.length > 0 && <StatsList items={restItems} />}
        </StatsPageShell>
    );
}
