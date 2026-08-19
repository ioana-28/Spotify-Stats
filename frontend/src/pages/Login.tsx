import { useEffect } from 'react';
import { Music2 } from 'lucide-react';
import { colors, fontDisplay, fontBody, stickerShadow } from '../theme';
import { injectStatsStylesOnce } from '../assets/StatsShared';

const styleSheetId = 'spotify-login-animations';
function injectLoginStylesOnce() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(styleSheetId)) return;
    const style = document.createElement('style');
    style.id = styleSheetId;
    style.textContent = `
        @keyframes login-vinyl-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        @keyframes login-card-in {
            from { opacity: 0; transform: translateY(14px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes login-dot-in {
            from { opacity: 0; transform: scale(0.4) rotate(var(--login-dot-rot, 0deg)); }
            to { opacity: 1; transform: scale(1) rotate(var(--login-dot-rot, 0deg)); }
        }
        .login-vinyl {
            animation: login-vinyl-spin 9s linear infinite;
        }
        .login-card {
            animation: login-card-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .login-dot {
            --login-dot-rot: 0deg;
            animation: login-dot-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
            transform: rotate(var(--login-dot-rot));
        }
        .login-cta {
            transition: transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.16s ease;
        }
        .login-cta:hover {
            transform: translate(-2px, -2px);
            box-shadow: 6px 6px 0px ${colors.ink};
        }
        .login-cta:active {
            transform: translate(1px, 1px) scale(0.97);
            box-shadow: 2px 2px 0px ${colors.ink};
        }
        .login-cta:focus-visible {
            outline: 2.5px solid ${colors.ink};
            outline-offset: 3px;
        }
        @media (prefers-reduced-motion: reduce) {
            .login-vinyl, .login-card, .login-dot, .login-cta {
                animation: none !important;
                transition: none !important;
            }
        }
    `;
    document.head.appendChild(style);
}

function Vinyl() {
    return (
        <svg width="88" height="88" viewBox="0 0 96 96" className="login-vinyl">
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
            className="login-dot"
            style={{
                position: 'absolute',
                top,
                left,
                right,
                bottom,
                width: size,
                height: size,
                borderRadius: '50%',
                backgroundColor: color,
                border: `2px solid ${colors.ink}`,
                boxShadow: stickerShadow(2),
                animationDelay: `${delay}ms`,
                ['--login-dot-rot' as any]: `${rotate}deg`,
            }}
        />
    );
}

export default function SpotifyLogin() {
    useEffect(() => {
        injectStatsStylesOnce();
        injectLoginStylesOnce();
    }, []);

    const handleConnect = () => {
        window.location.href = 'http://127.0.0.1:5000/api/auth/login';
    };

    return (
        <div
            className="stats-page-bg"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: colors.ink,
                padding: 24,
                boxSizing: 'border-box',
            }}
        >
            <div style={{ position: 'relative', width: '100%', maxWidth: 440 }}>
                <StickerDot color={colors.coral} top={-10} left={-10} rotate={-8} delay={80} />
                <StickerDot color={colors.sky} top={18} right={-14} size={12} rotate={12} delay={160} />
                <StickerDot color={colors.sunflower} bottom={-12} left={28} size={14} rotate={-14} delay={240} />

                <div
                    className="login-card"
                    style={{
                        backgroundColor: colors.panel,
                        border: `2.5px solid ${colors.ink}`,
                        borderRadius: 24,
                        padding: '40px 36px',
                        boxShadow: stickerShadow(6),
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                    }}
                >
                    <div style={{ marginBottom: 18 }}>
                        <Vinyl />
                    </div>


                    <h1 style={{
                        color: colors.ink,
                        fontFamily: fontDisplay,
                        fontSize: 30,
                        fontWeight: 600,
                        margin: '0 0 10px 0',
                        lineHeight: 1.15,
                    }}>
                        Your sound, sorted
                    </h1>

                    <p style={{
                        margin: '0 0 28px 0',
                        fontFamily: fontBody,
                        fontSize: 14,
                        fontWeight: 700,
                        color: colors.inkSoft,
                        maxWidth: 320,
                        lineHeight: 1.5,
                    }}>
                        Connect your Spotify account to see your top artists and tracks, ranked and ready.
                    </p>

                    <button className="login-cta" onClick={handleConnect} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 10,
                        backgroundColor: colors.mint,
                        color: colors.ink,
                        border: `2.5px solid ${colors.ink}`,
                        borderRadius: 999,
                        padding: '14px 30px',
                        fontFamily: fontDisplay,
                        fontWeight: 600,
                        fontSize: 16,
                        cursor: 'pointer',
                        boxShadow: stickerShadow(4),
                    }}>
                        <Music2 size={18} strokeWidth={2.4} />
                        Connect with Spotify
                    </button>

                </div>
            </div>
        </div>
    );
}
