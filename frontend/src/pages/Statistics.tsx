import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Sidebar from "../components/Sidebar";
import LogoutButton from "../components/LogoutButton";
import { Music, Disc, Tv, Mic, Clock } from "lucide-react";
import { colors, fontDisplay, fontBody, stickerShadow } from "../theme";

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

const sectionStyle = {
    backgroundColor: colors.panel,
    border: `2.5px solid ${colors.ink}`,
    borderRadius: 20,
    padding: 28,
    boxShadow: stickerShadow(4),
};

const sectionTitleStyle = {
    color: colors.ink,
    fontFamily: fontDisplay,
    fontSize: 24,
    fontWeight: 700,
    margin: "0 0 8px 0",
};

const sectionSubtitleStyle = {
    color: colors.inkSoft,
    fontFamily: fontBody,
    fontSize: 14,
    fontWeight: 700,
    margin: "0 0 24px 0",
};

const capsuleStyleId = "capsule-animations";

function injectCapsuleStylesOnce() {
    if (typeof document === "undefined") return;
    if (document.getElementById(capsuleStyleId)) return;
    const style = document.createElement("style");
    style.id = capsuleStyleId;
    style.textContent = `
    @keyframes capsule-fade-up {
      from { opacity: 0; transform: translateY(14px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes capsule-pop {
      0% { opacity: 0; transform: scale(0.7) rotate(-6deg); }
      70% { transform: scale(1.06) rotate(2deg); }
      100% { opacity: 1; transform: scale(1) rotate(0deg); }
    }
    @keyframes capsule-bar-grow {
      from { width: 0; }
      to { width: var(--capsule-width, 0%); }
    }
    @keyframes capsule-ring-spin {
      to { transform: rotate(360deg); }
    }
    .capsule-fade { animation: capsule-fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
    .capsule-pop { animation: capsule-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
    .capsule-bar { animation: capsule-bar-grow 0.9s cubic-bezier(0.22, 1, 0.36, 1) both; }
    .capsule-ring { animation: capsule-ring-spin 20s linear infinite; }
    @media (prefers-reduced-motion: reduce) {
      .capsule-fade, .capsule-pop, .capsule-bar, .capsule-ring { animation: none !important; }
    }
  `;
    document.head.appendChild(style);
}

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
        injectCapsuleStylesOnce();
    }, []);

    useEffect(() => {
        if (libraryData) return;
        setLoading(true);
        fetch("http://localhost:5000/api/stats", { credentials: "include" })
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
        fetch("http://localhost:5000/api/stats/time-capsule", {
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
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                backgroundColor: colors.ink,
            }}
        >
            <LogoutButton />
            <Sidebar />
            <main
                style={{
                    flex: 1,
                    padding: "36px 40px",
                    boxSizing: "border-box",
                    maxWidth: 920,
                    margin: "0 auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 24,
                }}
            >
                {/* Library Size */}
                <section style={sectionStyle}>
                    <h2 style={sectionTitleStyle}>Your Library Overview</h2>
                    <p style={sectionSubtitleStyle}>
                        Total media currently saved to your Spotify account.
                    </p>

                    {loading && (
                        <p style={{ color: colors.inkSoft, fontWeight: 700 }}>
                            Reading your library...
                        </p>
                    )}
                    {error && (
                        <p style={{ color: colors.coral, fontWeight: 700 }}>
                            {error}
                        </p>
                    )}

                    {!loading && !error && (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(180px, 1fr))",
                                gap: 16,
                            }}
                        >
                            {cards.map(
                                ({ title, count, icon: Icon, color }) => (
                                    <div
                                        key={title}
                                        style={{
                                            backgroundColor: colors.paper,
                                            border: `2.5px solid ${colors.ink}`,
                                            borderRadius: 16,
                                            padding: "20px 16px",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            textAlign: "center",
                                            boxShadow: stickerShadow(2),
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: 12,
                                                backgroundColor: color,
                                                border: `2px solid ${colors.ink}`,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                marginBottom: 12,
                                            }}
                                        >
                                            <Icon
                                                size={22}
                                                color={colors.ink}
                                                strokeWidth={2.5}
                                            />
                                        </div>
                                        <div
                                            style={{
                                                fontFamily: fontDisplay,
                                                fontSize: 28,
                                                fontWeight: 800,
                                                color: colors.ink,
                                                marginBottom: 4,
                                            }}
                                        >
                                            {count.toLocaleString()}
                                        </div>
                                        <div
                                            style={{
                                                fontFamily: fontBody,
                                                fontSize: 13,
                                                fontWeight: 700,
                                                color: colors.inkSoft,
                                            }}
                                        >
                                            {title}
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    )}
                </section>

                {/* Time Capsule */}
                <section style={sectionStyle}>
                    <h2 style={sectionTitleStyle}>Your Time Capsule</h2>
                    <p style={sectionSubtitleStyle}>
                        The era your listening lives in, based on your
                        most-listened tracks across all time ranges.
                    </p>

                    {capsuleLoading && (
                        <p style={{ color: colors.inkSoft, fontWeight: 700 }}>
                            Tuning into your eras...
                        </p>
                    )}
                    {capsuleError && (
                        <p style={{ color: colors.coral, fontWeight: 700 }}>
                            {capsuleError}
                        </p>
                    )}

                    {!capsuleLoading && !capsuleError && capsuleData && (
                        <>
                            {capsuleData.dominantDecade && dominantEra ? (
                                <div
                                    className="capsule-fade"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 24,
                                        flexWrap: "wrap",
                                        padding: "22px 24px",
                                        borderRadius: 18,
                                        border: `2.5px solid ${colors.ink}`,
                                        backgroundColor: colors.paper,
                                        boxShadow: stickerShadow(4),
                                        marginBottom: 28,
                                    }}
                                >
                                    <div
                                        className="capsule-pop"
                                        style={{
                                            position: "relative",
                                            width: 118,
                                            height: 118,
                                            flexShrink: 0,
                                            borderRadius: "50%",
                                            border: `3px solid ${colors.ink}`,
                                            backgroundColor:
                                                eraColors[dominantEra.decade] ??
                                                colors.sunflower,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            boxShadow: stickerShadow(3),
                                        }}
                                    >
                                        <div
                                            className="capsule-ring"
                                            style={{
                                                position: "absolute",
                                                inset: 8,
                                                borderRadius: "50%",
                                                border: `2.5px dashed ${colors.ink}`,
                                                opacity: 0.45,
                                            }}
                                        />
                                        <span
                                            style={{
                                                fontFamily: fontDisplay,
                                                fontSize: 30,
                                                fontWeight: 800,
                                                color: colors.ink,
                                                lineHeight: 1,
                                            }}
                                        >
                                            {dominantEra.decade}
                                        </span>
                                    </div>

                                    <div style={{ flex: 1, minWidth: 220 }}>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                                marginBottom: 6,
                                            }}
                                        >
                                            <Clock
                                                size={14}
                                                color={colors.inkSoft}
                                                strokeWidth={2.5}
                                            />
                                            <span
                                                style={{
                                                    fontFamily: fontBody,
                                                    fontSize: 11,
                                                    fontWeight: 800,
                                                    letterSpacing: 1.5,
                                                    textTransform: "uppercase",
                                                    color: colors.inkSoft,
                                                }}
                                            >
                                                Dominant Era
                                            </span>
                                        </div>
                                        <h3
                                            style={{
                                                fontFamily: fontDisplay,
                                                fontSize: 30,
                                                fontWeight: 700,
                                                color: colors.ink,
                                                margin: "0 0 6px 0",
                                                lineHeight: 1.1,
                                                textTransform: "capitalize",
                                            }}
                                        >
                                            {eraLabels[dominantEra.decade] ??
                                                dominantEra.decade}
                                        </h3>
                                        
                                        <p
                                            style={{
                                                fontFamily: fontBody,
                                                fontSize: 14,
                                                fontWeight: 700,
                                                color: colors.inkSoft,
                                                margin: 0,
                                            }}
                                        >
                                            {dominantEra.percentage}% of the{" "}
                                            {capsuleData.tracksAnalyzed} tracks
                                            analyzed come from this decade.
                                        </p>
                                        
                                        {capsuleData.changedFrom &&
                                            capsuleData.changedFrom !==
                                                dominantEra.decade && (
                                                <p
                                                    style={{
                                                        fontFamily: fontBody,
                                                        fontSize: 13,
                                                        fontWeight: 800,
                                                        color: colors.coral,
                                                        margin: "10px 0 0 0",
                                                    }}
                                                >
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
                                <p
                                    style={{
                                        color: colors.inkSoft,
                                        fontSize: 14,
                                        marginBottom: 24,
                                    }}
                                >
                                    Not enough release-date data to build your
                                    capsule yet. Keep listening and check back.
                                </p>
                            )}

                            {erasWithTracks.length > 0 && (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 14,
                                    }}
                                >
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
                                                className="capsule-fade"
                                                style={{
                                                    animationDelay: `${i * 70}ms`,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 14,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 74,
                                                        flexShrink: 0,
                                                        fontFamily: fontDisplay,
                                                        fontSize: 14,
                                                        fontWeight: isDominant
                                                            ? 800
                                                            : 600,
                                                        color: colors.ink,
                                                    }}
                                                >
                                                    {era.decade}
                                                </div>
                                                <div
                                                    style={{
                                                        flex: 1,
                                                        height: 34,
                                                        borderRadius: 10,
                                                        border: `2.5px solid ${colors.ink}`,
                                                        backgroundColor:
                                                            colors.paper,
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <div
                                                        className="capsule-bar"
                                                        style={
                                                            {
                                                                "--capsule-width": `${width}%`,
                                                                height: "100%",
                                                                width: `${width}%`,
                                                                borderRadius: 7,
                                                                borderRight:
                                                                    width > 0
                                                                        ? `2px solid ${colors.ink}`
                                                                        : "none",
                                                                backgroundColor:
                                                                    eraColors[
                                                                        era
                                                                            .decade
                                                                    ] ??
                                                                    colors.sunflower,
                                                                animationDelay: `${i * 70 + 120}ms`,
                                                                boxShadow:
                                                                    isDominant
                                                                        ? `inset 0 0 0 2px ${colors.ink}`
                                                                        : "none",
                                                            } as CSSProperties
                                                        }
                                                    />
                                                </div>
                                    
                                                <div
                                                    style={{
                                                        width: 82,
                                                        flexShrink: 0,
                                                        textAlign: "right",
                                                        fontFamily: fontBody,
                                                        fontSize: 13,
                                                        fontWeight: 800,
                                                        color: colors.ink,
                                                    }}
                                                >
                                                    {era.percentage}%
                                                    {/*
                                                    <span
                                                        style={{
                                                            display: "block",
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            color: colors.inkSoft,
                                                        }}
                                                    >
                                                      
                                                        {era.count}{" "}
                                                        {era.count === 1
                                                            ? "track"
                                                            : "tracks"}
                                                    </span>
                                                    */}
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
