import type { CSSProperties } from 'react';
import { Music2 } from 'lucide-react';
import { colors } from '../theme';
import shared from '../styles/StatsShared.module.css';
import styles from '../styles/Login.module.css';

function Vinyl() {
    return (
        <svg width="88" height="88" viewBox="0 0 96 96" className={styles.vinyl}>
            <circle cx="48" cy="48" r="44" fill={colors.ink} />
            <circle cx="48" cy="48" r="36" fill="none" stroke={colors.paper} strokeOpacity="0.14" strokeWidth="1.5" />
            <circle cx="48" cy="48" r="28" fill="none" stroke={colors.paper} strokeOpacity="0.14" strokeWidth="1.5" />
            <circle cx="48" cy="48" r="20" fill="none" stroke={colors.paper} strokeOpacity="0.14" strokeWidth="1.5" />
            <circle cx="48" cy="48" r="14" fill={colors.grape} stroke={colors.ink} strokeWidth="2.5" />
            <circle cx="48" cy="48" r="3" fill={colors.paper} />
        </svg>
    );
}

function StickerDot({
    color,
    top,
    left,
    right,
    bottom,
    size = 16,
    rotate = 0,
    delay = 0,
}: {
    color: string;
    top?: number | string;
    left?: number | string;
    right?: number | string;
    bottom?: number | string;
    size?: number;
    rotate?: number;
    delay?: number;
}) {
    return (
        <span
            className={styles.dot}
            style={{
                top,
                left,
                right,
                bottom,
                width: size,
                height: size,
                backgroundColor: color,
                animationDelay: `${delay}ms`,
                '--login-dot-rot': `${rotate}deg`,
            } as CSSProperties}
        />
    );
}

export default function SpotifyLogin() {
    const handleConnect = () => {
        window.location.href = 'http://127.0.0.1:5000/api/auth/login';
    };

    return (
        <div className={`${shared.pageBg} ${styles.page}`}>
            <div className={styles.cardWrapper}>
                <StickerDot color={colors.coral} top={-10} left={-10} rotate={-8} delay={80} />
                <StickerDot color={colors.sky} top={18} right={-14} size={12} rotate={12} delay={160} />
                <StickerDot color={colors.sunflower} bottom={-12} left={28} size={14} rotate={-14} delay={240} />

                <div className={styles.card}>
                    <div className={styles.vinylWrap}>
                        <Vinyl />
                    </div>

                    <h1 className={styles.title}>Your sound, sorted</h1>

                    <p className={styles.subtitle}>
                        Connect your Spotify account to see your top artists and tracks, ranked and ready.
                    </p>

                    <button className={styles.cta} onClick={handleConnect}>
                        <Music2 size={18} strokeWidth={2.4} />
                        Connect with Spotify
                    </button>
                </div>
            </div>
        </div>
    );
}
