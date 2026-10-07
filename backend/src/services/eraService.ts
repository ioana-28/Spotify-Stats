export const ERA_BUCKETS = [
    "Pre-80s",
    "80s",
    "90s",
    "00s",
    "10s",
    "20s",
] as const;

export type EraBucket = (typeof ERA_BUCKETS)[number];

export interface SpotifyTrackLike {
    id: string;
    album?: {
        release_date?: string;
        release_date_precision?: string;
    };
}

export interface EraCountResult {
    decade: EraBucket;
    count: number;
    score: number;
    percentage: number;
}

export interface EraAnalysis {
    tracksAnalyzed: number;
    dominantDecade: EraBucket | null;
    eras: EraCountResult[];
}

export function decadeForYear(year: number): EraBucket {
    if (year < 1980) return "Pre-80s";
    if (year < 1990) return "80s";
    if (year < 2000) return "90s";
    if (year < 2010) return "00s";
    if (year < 2020) return "10s";
    return "20s";
}

export function extractYear(releaseDate?: string): number | null {
    if (!releaseDate) return null;
    const year = Number.parseInt(releaseDate.slice(0, 4), 10);
    if (Number.isNaN(year) || year < 1000 || year > 2999) return null;
    return year;
}

interface RangeInput {
    items: SpotifyTrackLike[];
}

export function analyzeEras(ranges: RangeInput[]): EraAnalysis {
    const totals: Record<EraBucket, { count: number; score: number }> = {
        "Pre-80s": { count: 0, score: 0 },
        "80s": { count: 0, score: 0 },
        "90s": { count: 0, score: 0 },
        "00s": { count: 0, score: 0 },
        "10s": { count: 0, score: 0 },
        "20s": { count: 0, score: 0 },
    };

    const seenTracks = new Set<string>();

    for (const range of ranges) {
        const total = range.items.length;
        range.items.forEach((track, index) => {
            const year = extractYear(track.album?.release_date);
            if (year === null) return;

            const decade = decadeForYear(year);
            const weight = total - index;

            totals[decade].count += 1;
            totals[decade].score += weight;
            seenTracks.add(track.id);
        });
    }

    const totalScore = ERA_BUCKETS.reduce(
        (sum, bucket) => sum + totals[bucket].score,
        0,
    );

    const eras: EraCountResult[] = ERA_BUCKETS.map((decade) => ({
        decade,
        count: totals[decade].count,
        score: totals[decade].score,
        percentage:
            totalScore > 0
                ? Math.round((totals[decade].score / totalScore) * 100)
                : 0,
    }));

    const dominantDecade = eras.reduce<EraBucket | null>((best, era) => {
        if (era.score === 0) return best;
        if (best === null) return era.decade;
        const current = eras.find((e) => e.decade === best)!;
        if (era.score > current.score) return era.decade;
        if (era.score === current.score && era.count > current.count) {
            return era.decade;
        }
        return best;
    }, null);

    return {
        tracksAnalyzed: seenTracks.size,
        dominantDecade,
        eras,
    };
}

export function eraDistributionKey(analysis: EraAnalysis): string {
    return analysis.eras
        .map((era) => `${era.decade}:${era.count}:${era.score}`)
        .join("|");
}
