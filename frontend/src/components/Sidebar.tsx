import React, { useEffect } from 'react';
import { Home, Users, Disc3, ListMusic, Settings, User, Star } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';    
import { colors } from '../theme';
import styles from '../styles/Sidebar.module.css';

interface UserProfile {
    displayName: string;
    avatarUrl: string;
}

const navItems = [
  { label: 'Overview', path:'/dashboard', icon: Home, color: colors.coral },
  { label: 'Top Artists', path:'/top-artists', icon: Users, color: colors.sky },
  { label: 'Top Tracks', path:'/top-tracks', icon: ListMusic, color: colors.sunflower },
  { label: 'Genres', path:'/top-genres', icon: Disc3, color: colors.grape },
  { label: 'Statistics', path:'/stats', icon: Star, color: colors.mint },
   
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = React.useState(() =>
    location.pathname === '/stats' ? 'Statistics' :
    location.pathname === '/top-artists' ? 'Top Artists' :
    location.pathname === '/top-tracks' ? 'Top Tracks' : 
    location.pathname === '/top-genres' ? 'Genres' : 'Overview'
  );
  const [profile, setProfile] = React.useState<UserProfile | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/auth/me', { credentials: 'include' })
        .then((res) => { 
            if(!res.ok) {
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
            <div className={styles.brandMark}>
                ♪
            </div>

            <span className={styles.brandName}>
                Name 6769
            </span>
        </div>

        <nav className={styles.nav}>
            {navItems.map(({ label, path, icon: Icon, color }) => {
                const isActive = activeItem === label;
                return (
                    <button
                        key={label}
                        onClick={() => { setActiveItem(label); navigate(path); }}
                        className={`${styles.navButton} ${isActive ? styles.navButtonActive : ''}`}
                        style={{ '--nav-accent': color } as React.CSSProperties}
                    >
                    <Icon size={20} />
                    {label}
                </button>
                );
            })}
        </nav>

      
        
        <div className={styles.footer}>
        <div className={styles.footerInner}>
          <button className={styles.settingsButton}>
            <Settings size={17} strokeWidth={2.5} />
            Settings
          </button>

          <div className={styles.profile}>
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className={styles.profileAvatar}
              />
            ) : (
              <div className={styles.profileAvatarPlaceholder}>
                <User size={14} color={colors.ink} strokeWidth={2.5} />
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
        
    </aside>


  );
}
