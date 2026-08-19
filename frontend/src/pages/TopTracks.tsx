import React, { useEffect, useState } from 'react';
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

function MetaLine({ children }: { children: React.ReactNode }) {
    return (
        <span style={{ color: colors.inkSoft, fontSize: 13, fontFamily: fontBody, fontWeight: 700 }}>
            {children}
        </span>
    );
}

interface Track {
    id?: string;
    spotifyId: string;
    name: string;
    artist: string;
    album: string;
    imageUrl: string | null;
    rank: number;
}

const subtitles: Record<TimeRange, string> = {
    short_term: 'the songs you couldn\u2019t stop replaying',
    medium_term: 'your soundtrack this season',
    long_term: 'the tracks that stuck with you',
};

export default function TopTracks() {
    const [loading, setLoading] = useState(true);
    const [tracks, setTracks] = useState<Track[]>([]);
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

        fetch(`http://localhost:5000/api/top-tracks?timeRange=${selectedTimeRange}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch stats');
                return res.json();
            })
            .then((data: { items: Track[] }) => {
                if (ignore) return;
                setTracks(data.items);
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

    const toStatsItem = (track: Track): StatsItem => ({
        key: track.id || track.rank,
        imageUrl: track.imageUrl,
        imageAlt: track.name,
        title: track.name,
        subtitle: <MetaLine>{track.artist}{track.album ? ` \u00b7 ${track.album}` : ''}</MetaLine>,
        loaded: !!loadedImages[track.spotifyId],
        onImageLoad: () => setLoadedImages((prev) => ({ ...prev, [track.spotifyId]: true })),
    });

    const podiumItems = tracks.slice(0, 3).map(toStatsItem);
    const restItems = tracks.slice(3).map(toStatsItem);

    return (
        <StatsPageShell>
            <StatsHeader
                titlePrefix="Top"
                highlightWord="Tracks"
                subtitle={subtitles[selectedTimeRange]}
                options={timeRangeOptions}
                selected={selectedTimeRange}
                onSelect={setSelectedTimeRange}
            />

            {loading && <SkeletonList />}
            {error && !loading && <ErrorMessage message={error} />}
            {!loading && !error && tracks.length === 0 && <EmptyMessage message="No tracks found." />}
            {!loading && !error && podiumItems.length > 0 && <PodiumRow items={podiumItems} />}
            {!loading && !error && restItems.length > 0 && <StatsList items={restItems} />}
        </StatsPageShell>
    );
}
