import React, { useEffect, useState } from 'react';
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
    Pills,
} from '../assets/StatsShared';
import type { TimeRange, StatsItem } from '../assets/StatsShared';

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
