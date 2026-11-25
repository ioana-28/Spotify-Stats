import React from 'react';
import Sidebar from '../components/Sidebar';
import { Crown, Medal, Award } from 'lucide-react';
import { colors } from '../theme';
import styles from '../styles/StatsShared.module.css';

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

export const podiumStyle: Record<number, { icon: typeof Crown; accent: string }> = {
    0: { icon: Crown, accent: colors.sunflower },
    1: { icon: Medal, accent: colors.sky },
    2: { icon: Award, accent: colors.mint },
};

const podiumSizeClass: Record<number, string> = {
    0: styles.podiumFirst,
    1: styles.podiumSecond,
    2: styles.podiumThird,
};

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
    const dimensionStyle = { width: size, height: size };

    if (imageUrl) {
        return (
            <img
                className={`${styles.avatar} ${loaded ? '' : styles.avatarHidden}`}
                src={imageUrl}
                alt={alt}
                onLoad={onLoad}
                style={dimensionStyle}
            />
        );
    }
    return <div className={styles.avatarPlaceholder} style={dimensionStyle} />;
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
        <div className={styles.tabBar}>
            {options.map((option) => {
                const isActive = selected === option.id;
                return (
                    <button
                        key={option.id}
                        className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
                        onClick={() => onSelect(option.id)}
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
        <div className={styles.header}>
            <div className={styles.eyebrowRow}>
                <span className={styles.eyebrowDot} />
                <span className={styles.eyebrow}>{eyebrow}</span>
            </div>

            <h2 className={styles.title}>
                {titlePrefix}{' '}
                <span className={styles.titleHighlight}>
                    <span className={styles.titleHighlightBackdrop} />
                    <span className={styles.titleHighlightText}>{highlightWord}</span>
                </span>
            </h2>

            <p className={styles.subtitle}>{subtitle}</p>

            <TabBar options={options} selected={selected} onSelect={onSelect} />
        </div>
    );
}

export function SkeletonList() {
    return (
        <div className={styles.skeletonList}>
            {[0, 1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className={`${styles.skeletonShimmer} ${styles.skeletonItem}`}
                    style={{ opacity: 1 - i * 0.12 }}
                />
            ))}
        </div>
    );
}

export function ErrorMessage({ message }: { message: string }) {
    return <p className={`${styles.error} ${styles.errorMessage}`}>{message}</p>;
}

export function EmptyMessage({ message }: { message: string }) {
    return <p className={styles.emptyMessage}>{message}</p>;
}

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
    const order = [1, 0, 2].filter((i) => items[i]);

    return (
        <div className={styles.podiumRow}>
            {order.map((idx) => {
                const item = items[idx];
                const { icon: MedalIcon, accent } = podiumStyle[idx];
                const isFirst = idx === 0;
                const avatarSize = isFirst ? 92 : 72;
                return (
                    <div
                        key={item.key}
                        className={`${styles.podiumCard} ${podiumSizeClass[idx]}`}
                    >
                        <div
                            className={styles.podiumMedal}
                            style={{ backgroundColor: accent }}
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

                        <div
                            className={`${styles.podiumTitle} ${isFirst ? styles.podiumTitleFirst : ''}`}
                        >
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
        <div className={styles.list}>
            {items.map((item, i) => (
                <div
                    key={item.key}
                    className={styles.row}
                    style={{ animationDelay: `${i * 40}ms` }}
                >
                    <div className={styles.rankBadge}>{i + startRank}</div>

                    <Avatar
                        imageUrl={item.imageUrl}
                        alt={item.imageAlt}
                        size={46}
                        loaded={item.loaded}
                        onLoad={item.onImageLoad}
                    />

                    <div className={styles.rowBody}>
                        <div className={styles.rowTitle}>{item.title}</div>
                        {item.subtitle}
                    </div>
                </div>
            ))}
        </div>
    );
}

export function StatsPageShell({ children }: { children: React.ReactNode }) {
    return (
        <div className={`${styles.pageBg} ${styles.shell}`}>
            <Sidebar />
            <main className={styles.main}>
                <section className={styles.section}>{children}</section>
            </main>
        </div>
    );
}
