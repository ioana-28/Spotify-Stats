import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Sidebar from "../components/Sidebar";
import LogoutButton from "../components/LogoutButton";
import { Music, Disc, Tv, Mic, Clock } from "lucide-react";
import { colors } from "../theme";
import styles from "../styles/Statistics.module.css";

interface LibrarySizes {
    tracks: number;
    albums: number;
    shows: number;
    episodes: number;
}

interface EraCount {
    decade: string;
    count: number;
    score: number;
    percentage: number;
}

interface TimeCapsuleData {
    dominantDecade: string | null;
    tracksAnalyzed: number;
    eras: EraCount[];
    changedFrom: string | null;
    createdAt: string | null;
}

const eraLabels: Record<string, string> = {
    "Pre-80s": "the Pre-80s",
    "80s": "the 80s",
    "90s": "the 90s",
    "00s": "the 2000s",
    "10s": "the 2010s",
    "20s": "the 2020s",
};

const eraColors: Record<string, string> = {
    "Pre-80s": colors.grape,
    "80s": colors.coral,
    "90s": colors.sunflower,
    "00s": colors.mint,
    "10s": colors.sky,
    "20s": "#F58BC0",
};

export default function Statistics() {
    const [libraryData, setLibraryData] = useState<LibrarySizes | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [capsuleData, setCapsuleData] = useState<TimeCapsuleData | null>(
        null,
    );
    const [capsuleLoading, setCapsuleLoading] = useState(false);
    const [capsuleError, setCapsuleError] = useState<string | null>(null);

    useEffect(() => {
        if (libraryData) return;
        setLoading(true);
        fetch("http://127.0.0.1:5000/api/stats", { credentials: "include" })
            .then((res) => {
                if (res.status === 401) {
                    window.location.href = "/login";
                    return;
                }
                if (!res.ok)
                    throw new Error("Failed to fetch library statistics");
                return res.json();
            })
            .then((data) => {
                setLibraryData(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [libraryData]);

    useEffect(() => {
        if (capsuleData) return;
        setCapsuleLoading(true);
        setCapsuleError(null);
        fetch("http://127.0.0.1:5000/api/stats/time-capsule", {
            credentials: "include",
        })
            .then((res) => {
                if (res.status === 401) {
                    window.location.href = "/login";
                    return;
                }
                if (!res.ok)
                    throw new Error("Failed to fetch your time capsule");
                return res.json();
            })
            .then((data: TimeCapsuleData) => {
                setCapsuleData(data);
                setCapsuleLoading(false);
            })
            .catch((err) => {
                setCapsuleError(err.message);
                setCapsuleLoading(false);
            });
    }, [capsuleData]);

    const cards = [
        {
            title: "Liked Songs",
            count: libraryData?.tracks ?? 0,
            icon: Music,
            color: colors.coral,
        },
        {
            title: "Saved Albums",
            count: libraryData?.albums ?? 0,
            icon: Disc,
            color: colors.sky,
        },
        {
            title: "Podcasts (Shows)",
            count: libraryData?.shows ?? 0,
            icon: Tv,
            color: colors.mint,
        },
        {
            title: "Saved Episodes",
            count: libraryData?.episodes ?? 0,
            icon: Mic,
            color: colors.sunflower,
        },
    ];

    const dominantEra = capsuleData?.eras.find(
        (era) => era.decade === capsuleData.dominantDecade,
    );
    const erasWithTracks =
        capsuleData?.eras.filter((era) => era.count > 0) ?? [];
    const maxPercentage = Math.max(
        1,
        ...erasWithTracks.map((era) => era.percentage),
    );

    return (
        <div className={styles.page}>
            <LogoutButton />
            <Sidebar />
            <main className={styles.main}>
                {/* Library Size */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Your Library Overview</h2>
                    <p className={styles.sectionSubtitle}>
                        Total media currently saved to your Spotify account.
                    </p>

                    {loading && (
                        <p className={styles.statusText}>Reading your library...</p>
                    )}
                    {error && <p className={styles.errorText}>{error}</p>}

                    {!loading && !error && (
                        <div className={styles.cardsGrid}>
                            {cards.map(
                                ({ title, count, icon: Icon, color }) => (
                                    <div key={title} className={styles.card}>
                                        <div
                                            className={styles.cardIcon}
                                            style={{ backgroundColor: color }}
                                        >
                                            <Icon
                                                size={22}
                                                color={colors.ink}
                                                strokeWidth={2.5}
                                            />
                                        </div>
                                        <div className={styles.cardCount}>
                                            {count.toLocaleString()}
                                        </div>
                                        <div className={styles.cardLabel}>
                                            {title}
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    )}
                </section>

                {/* Time Capsule */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Your Time Capsule</h2>
                    <p className={styles.sectionSubtitle}>
                        The era your listening lives in, based on your
                        most-listened tracks across all time ranges.
                    </p>

                    {capsuleLoading && (
                        <p className={styles.statusText}>Tuning into your eras...</p>
                    )}
                    {capsuleError && (
                        <p className={styles.errorText}>{capsuleError}</p>
                    )}

                    {!capsuleLoading && !capsuleError && capsuleData && (
                        <>
                            {capsuleData.dominantDecade && dominantEra ? (
                                <div className={`${styles.capsuleCard} ${styles.fade}`}>
                                    <div
                                        className={`${styles.capsuleBadge} ${styles.pop}`}
                                        style={{
                                            backgroundColor:
                                                eraColors[dominantEra.decade] ??
                                                colors.sunflower,
                                        }}
                                    >
                                        <div
                                            className={`${styles.capsuleRing} ${styles.ring}`}
                                        />
                                        <span className={styles.capsuleDecade}>
                                            {dominantEra.decade}
                                        </span>
                                    </div>

                                    <div className={styles.capsuleBody}>
                                        <div className={styles.capsuleEyebrow}>
                                            <Clock
                                                size={14}
                                                color={colors.inkSoft}
                                                strokeWidth={2.5}
                                            />
                                            <span className={styles.capsuleEyebrowText}>
                                                Dominant Era
                                            </span>
                                        </div>
                                        <h3 className={styles.capsuleHeading}>
                                            {eraLabels[dominantEra.decade] ??
                                                dominantEra.decade}
                                        </h3>

                                        <p className={styles.capsuleDescription}>
                                            {dominantEra.percentage}% of the{" "}
                                            {capsuleData.tracksAnalyzed} tracks
                                            analyzed come from this decade.
                                        </p>

                                        {capsuleData.changedFrom &&
                                            capsuleData.changedFrom !==
                                                dominantEra.decade && (
                                                <p className={styles.capsuleDrift}>
                                                    Your capsule has drifted
                                                    from{" "}
                                                    {eraLabels[
                                                        capsuleData.changedFrom
                                                    ] ??
                                                        capsuleData.changedFrom}{" "}
                                                    to{" "}
                                                    {eraLabels[
                                                        dominantEra.decade
                                                    ] ?? dominantEra.decade}
                                                    .
                                                </p>
                                            )}
                                    </div>
                                </div>
                            ) : (
                                <p className={styles.capsuleEmpty}>
                                    Not enough release-date data to build your
                                    capsule yet. Keep listening and check back.
                                </p>
                            )}

                            {erasWithTracks.length > 0 && (
                                <div className={styles.eraList}>
                                    {erasWithTracks.map((era, i) => {
                                        const width =
                                            maxPercentage > 0
                                                ? (era.percentage /
                                                      maxPercentage) *
                                                  100
                                                : 0;
                                        const isDominant =
                                            era.decade ===
                                            capsuleData.dominantDecade;
                                        return (
                                            <div
                                                key={era.decade}
                                                className={`${styles.eraRow} ${styles.fade}`}
                                                style={{
                                                    animationDelay: `${i * 70}ms`,
                                                }}
                                            >
                                                <div
                                                    className={`${styles.eraLabel} ${isDominant ? styles.eraLabelDominant : ''}`}
                                                >
                                                    {era.decade}
                                                </div>
                                                <div className={styles.eraBarTrack}>
                                                    <div
                                                        className={`${styles.eraBarFill} ${styles.bar} ${isDominant ? styles.eraBarFillDominant : ''}`}
                                                        style={
                                                            {
                                                                "--capsule-width": `${width}%`,
                                                                width: `${width}%`,
                                                                backgroundColor:
                                                                    eraColors[
                                                                        era
                                                                            .decade
                                                                    ] ??
                                                                    colors.sunflower,
                                                                animationDelay: `${i * 70 + 120}ms`,
                                                                borderRight:
                                                                    width > 0
                                                                        ? `2px solid ${colors.ink}`
                                                                        : "none",
                                                            } as CSSProperties
                                                        }
                                                    />
                                                </div>

                                                <div className={styles.eraPercentage}>
                                                    {era.percentage}%
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}
