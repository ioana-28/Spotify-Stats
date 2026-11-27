import { useEffect, useState, type CSSProperties } from 'react';
import { Home, Users, Disc3, ListMusic, User, Star } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { colors, navAccents } from '../theme';
import LogoutButton from './LogoutButton';
import styles from '../styles/Sidebar.module.css';

interface UserProfile {
  displayName: string;
  avatarUrl: string;
}

const navItems = [
  { label: 'Overview', path: '/dashboard', icon: Home, color: navAccents.olive },
  { label: 'Top Artists', path: '/top-artists', icon: Users, color: navAccents.ink },
  { label: 'Top Tracks', path: '/top-tracks', icon: ListMusic, color: navAccents.deepOlive },
  { label: 'Genres', path: '/top-genres', icon: Disc3, color: navAccents.olive },
  { label: 'Statistics', path: '/stats', icon: Star, color: navAccents.forest },
];

export default function Sidebar() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/auth/me', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch user data');
        }
        return res.json();
      })
      .then((data: UserProfile) => setProfile(data))
      .catch((err) => console.error('Error fetching user data:', err));
  }, []);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandMark} aria-hidden="true">
          ♪
        </div>

        <span className={styles.brandName}>Name 6769</span>
      </div>

      <nav className={styles.nav} aria-label="Primary">
        {navItems.map(({ label, path, icon: Icon, color }) => (
          <NavLink
            key={label}
            to={path}
            aria-label={label}
            title={label}
            className={({ isActive }) =>
              `${styles.navButton} ${isActive ? styles.navButtonActive : ''}`
            }
            style={{ '--nav-accent': color } as CSSProperties}
          >
            <Icon size={20} aria-hidden="true" />
            <span className={styles.navLabel}>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.footerInner}>
          {/* <button type="button" className={styles.settingsButton}>
            <Settings size={17} strokeWidth={2.5} aria-hidden="true" />
            Settings
          </button> */}

          <div className={styles.profile}>
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt=""
                className={styles.profileAvatar}
              />
            ) : (
              <div className={styles.profileAvatarPlaceholder}>
                <User size={14} color={colors.ink} strokeWidth={2.5} aria-hidden="true" />
              </div>
            )}

            <div className={styles.profileInfo}>
              <div className={styles.profileName}>
                {profile?.displayName || 'Loading...'}
              </div>
              <div className={styles.profileSub}>Spotify account</div>
            </div>
          </div>
        </div>
      </div>

      <LogoutButton />
    </aside>
  );
}
