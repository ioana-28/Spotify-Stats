import React from 'react';
import Sidebar from '../components/Sidebar';
import { Crown, Medal, Award } from 'lucide-react';
import { colors, fontDisplay, fontBody, stickerShadow } from '../theme';

export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

export interface TimeRangeOption {
    id: TimeRange;
    label: string;
}

export const timeRangeOptions: TimeRangeOption[] = [
    { id: 'short_term', label: 'Past Month' },
    { id: 'medium_term', label: 'Past 6 Months' },
    { id: 'long_term', label: 'All Time' },
];

export const pillPalette = [colors.coral, colors.sky, colors.mint, colors.grape, colors.sunflower];

export const podiumStyle: Record<number, { icon: typeof Crown; accent: string }> = {
    0: { icon: Crown, accent: colors.sunflower },
    1: { icon: Medal, accent: colors.sky },
    2: { icon: Award, accent: colors.mint },
};

const podiumSizeClass: Record<number, string> = {
    0: 'stats-podium-first',
    1: 'stats-podium-second',
    2: 'stats-podium-third',
};


const styleSheetId = 'stats-page-animations';
export function injectStatsStylesOnce() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(styleSheetId)) return;
    const style = document.createElement('style');
    style.id = styleSheetId;
    style.textContent = `
        @keyframes stats-row-in {
            from { opacity: 0; transform: translateY(10px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes stats-podium-in {
            from { opacity: 0; transform: translateY(16px) scale(0.9) rotate(var(--stats-rot, 0deg)); }
            to { opacity: 1; transform: translateY(var(--stats-lift, 0px)) scale(1) rotate(var(--stats-rot, 0deg)); }
        }
        @keyframes stats-shimmer {
            0% { background-position: -400px 0; }
            100% { background-position: 400px 0; }
        }
        @keyframes stats-shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-4px); }
            40% { transform: translateX(4px); }
            60% { transform: translateX(-3px); }
            80% { transform: translateX(3px); }
        }
        .stats-page-bg {
            background-image: radial-gradient(${colors.ink}14 1.4px, transparent 1.4px);
            background-size: 18px 18px;
        }
        .stats-tab {
            transition: transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1),
                        box-shadow 0.16s ease, background-color 0.16s ease;
        }
        .stats-tab:hover { transform: translate(-1px, -1px); }
        .stats-tab:active { transform: translate(1px, 1px) scale(0.97); }
        .stats-tab:focus-visible { outline: 2.5px solid ${colors.ink}; outline-offset: 2px; }

        .stats-row {
            transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s ease;
            animation: stats-row-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .stats-row:hover { transform: translate(-2px, -2px); }
        .stats-avatar-img { transition: opacity 0.3s ease, transform 0.18s ease; }
        .stats-row:hover .stats-avatar-img { transform: scale(1.05); }
        .stats-rank-badge { transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .stats-row:hover .stats-rank-badge { transform: scale(1.1) rotate(-6deg); }

        .stats-podium-card {
            --stats-rot: 0deg;
            --stats-lift: 0px;
            animation: stats-podium-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
            transform: translateY(var(--stats-lift)) rotate(var(--stats-rot));
        }
        .stats-podium-card:hover {
            --stats-rot: 0deg !important;
            transform: translateY(calc(var(--stats-lift) - 4px)) rotate(0deg) !important;
        }
        .stats-podium-first { --stats-rot: 0deg; --stats-lift: -14px; }
        .stats-podium-second { --stats-rot: -3deg; }
        .stats-podium-third { --stats-rot: 3deg; }
        .stats-podium-medal { transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .stats-podium-card:hover .stats-podium-medal { transform: scale(1.12) rotate(-8deg); }

        .stats-skeleton {
            background: linear-gradient(90deg, ${colors.panel} 0%, #F3ECDD 50%, ${colors.panel} 100%);
            background-size: 800px 100%;
            animation: stats-shimmer 1.4s ease-in-out infinite;
        }
        .stats-error { animation: stats-shake 0.4s ease; }

        @media (max-width: 680px) {
            .stats-podium-row { flex-direction: column; }
            .stats-podium-card { --stats-rot: 0deg !important; --stats-lift: 0px !important; width: 100% !important; }
        }
        @media (prefers-reduced-motion: reduce) {
            .stats-row, .stats-tab, .stats-avatar-img, .stats-rank-badge, .stats-podium-card, .stats-podium-medal {
                animation: none !important;
                transition: none !important;
            }
        }
    `;
    document.head.appendChild(style);
}

export function Pills({ items }: { items: string[] }) {
    if (!items || items.length === 0) {
        return (
            <span style={{ color: colors.inkSoft, fontSize: 12, fontFamily: fontBody, fontWeight: 700 }}>
                Various genres
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
                    {item}
                </span>
            ))}
        </div>
    );
}

export function MetaLine({ children }: { children: React.ReactNode }) {
    return (
        <span style={{ color: colors.inkSoft, fontSize: 13, fontFamily: fontBody, fontWeight: 700 }}>
            {children}
        </span>
    );
}

export function Avatar({
    imageUrl,
    alt,
    size,
    loaded,
    onLoad,
}: {
    imageUrl: string | null;
    alt: string;
    size: number;
    loaded: boolean;
    onLoad: () => void;
}) {
    if (imageUrl) {
        return (
            <img
                className="stats-avatar-img"
                src={imageUrl}
                alt={alt}
                onLoad={onLoad}
                style={{
                    width: size,
                    height: size,
                    flexShrink: 0,
                    borderRadius: '50%',
                    border: `2.5px solid ${colors.ink}`,
                    objectFit: 'cover',
                    opacity: loaded ? 1 : 0,
                    backgroundColor: colors.panel,
                }}
            />
        );
    }
    return (
        <div
            style={{
                width: size,
                height: size,
                flexShrink: 0,
                borderRadius: '50%',
                border: `2.5px solid ${colors.ink}`,
                backgroundColor: colors.panel,
            }}
        />
    );
}

export function TabBar({
    options,
    selected,
    onSelect,
}: {
    options: TimeRangeOption[];
    selected: TimeRange;
    onSelect: (id: TimeRange) => void;
}) {
    return (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {options.map((option) => {
                const isActive = selected === option.id;
                return (
                    <button
                        key={option.id}
                        className="stats-tab"
                        onClick={() => onSelect(option.id)}
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
    );
}

export function StatsHeader({
    eyebrow = 'Listening Activity',
    titlePrefix,
    highlightWord,
    subtitle,
    options,
    selected,
    onSelect,
}: {
    eyebrow?: string;
    titlePrefix: string;
    highlightWord: string;
    subtitle: string;
    options: TimeRangeOption[];
    selected: TimeRange;
    onSelect: (id: TimeRange) => void;
}) {
    return (
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
                    {eyebrow}
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
                {titlePrefix}{' '}
                <span style={{ position: 'relative', display: 'inline-block' }}>
                    <span style={{
                        position: 'absolute',
                        inset: '4px -6px 0px -6px',
                        transform: 'rotate(-2deg)',
                        borderRadius: 5,
                        zIndex: 0,
                    }} />
                    <span style={{ position: 'relative', zIndex: 1 }}>{highlightWord}</span>
                </span>
            </h2>

            <p style={{
                margin: '0 0 20px 0',
                fontFamily: fontBody,
                fontSize: 14,
                fontWeight: 700,
                color: colors.inkSoft,
            }}>
                {subtitle}
            </p>

            <TabBar options={options} selected={selected} onSelect={onSelect} />
        </div>
    );
}

export function SkeletonList() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[0, 1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className="stats-skeleton"
                    style={{
                        height: 74,
                        borderRadius: 12,
                        border: `2.5px solid ${colors.ink}`,
                        opacity: 1 - i * 0.12,
                    }}
                />
            ))}
        </div>
    );
}

export function ErrorMessage({ message }: { message: string }) {
    return (
        <p className="stats-error" style={{ color: colors.coral, fontSize: 14, fontWeight: 700 }}>
            {message}
        </p>
    );
}

export function EmptyMessage({ message }: { message: string }) {
    return <p style={{ color: colors.inkSoft, fontSize: 14 }}>{message}</p>;
}

// ---------------------------------------------------------------------------
// Podium (top 3) + rest-of-list
// ---------------------------------------------------------------------------

export interface StatsItem {
    key: string | number;
    imageUrl: string | null;
    imageAlt: string;
    title: string;
    subtitle: React.ReactNode;
    loaded: boolean;
    onImageLoad: () => void;
}

export function PodiumRow({ items }: { items: StatsItem[] }) {
    if (items.length === 0) return null;
    // Visual order: 2nd, 1st, 3rd — so the top spot sits centered and raised.
    const order = [1, 0, 2].filter((i) => items[i]);

    return (
        <div
            className="stats-podium-row"
            style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 32, paddingTop: 18 }}
        >
            {order.map((idx) => {
                const item = items[idx];
                const { icon: MedalIcon, accent } = podiumStyle[idx];
                const isFirst = idx === 0;
                const avatarSize = isFirst ? 92 : 72;
                return (
                    <div
                        key={item.key}
                        className={`stats-podium-card ${podiumSizeClass[idx]}`}
                        style={{
                            flex: isFirst ? '1.15 1 0' : '1 1 0',
                            minWidth: 190,
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            gap: 10,
                            padding: isFirst ? '32px 16px 20px' : '26px 14px 18px',
                            borderRadius: 18,
                            border: `2.5px solid ${colors.ink}`,
                            backgroundColor: colors.paper,
                            boxShadow: stickerShadow(isFirst ? 6 : 4),
                        }}
                    >
                        <div
                            className="stats-podium-medal"
                            style={{
                                position: 'absolute',
                                top: -16,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 34,
                                height: 34,
                                borderRadius: '50%',
                                border: `2.5px solid ${colors.ink}`,
                                backgroundColor: accent,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <MedalIcon size={17} color={colors.ink} strokeWidth={2.4} />
                        </div>

                        <Avatar
                            imageUrl={item.imageUrl}
                            alt={item.imageAlt}
                            size={avatarSize}
                            loaded={item.loaded}
                            onLoad={item.onImageLoad}
                        />

                        <div style={{
                            color: colors.ink,
                            fontFamily: fontDisplay,
                            fontSize: isFirst ? 17 : 15,
                            fontWeight: 600,
                            lineHeight: 1.2,
                        }}>
                            {item.title}
                        </div>

                        {item.subtitle}
                    </div>
                );
            })}
        </div>
    );
}

export function StatsList({ items, startRank = 4 }: { items: StatsItem[]; startRank?: number }) {
    if (items.length === 0) return null;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map((item, i) => (
                <div
                    key={item.key}
                    className="stats-row"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 15px',
                        borderRadius: 12,
                        border: `2.5px solid ${colors.ink}`,
                        backgroundColor: colors.paper,
                        animationDelay: `${i * 40}ms`,
                    }}
                >
                    <div className="stats-rank-badge" style={{
                        width: 42,
                        height: 42,
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
                        fontSize: 14,
                    }}>
                        {i + startRank}
                    </div>

                    <Avatar
                        imageUrl={item.imageUrl}
                        alt={item.imageAlt}
                        size={46}
                        loaded={item.loaded}
                        onLoad={item.onImageLoad}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ color: colors.ink, fontFamily: fontDisplay, fontSize: 15, fontWeight: 600 }}>
                            {item.title}
                        </div>
                        {item.subtitle}
                    </div>
                </div>
            ))}
        </div>
    );
}

export function StatsPageShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="stats-page-bg" style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.ink }}>
            <Sidebar />
            <main style={{ flex: 1, padding: '36px 40px', boxSizing: 'border-box', maxWidth: 920, margin: '0 auto' }}>
                <section style={{
                    backgroundColor: colors.panel,
                    border: `2.5px solid ${colors.ink}`,
                    borderRadius: 20,
                    padding: 28,
                    boxShadow: stickerShadow(4),
                }}>
                    {children}
                </section>
            </main>
        </div>
    );
}
