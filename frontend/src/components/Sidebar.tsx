import React from 'react';
import { Home, Users, Disc3, ListMusic, Settings, User, Star } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';    
import { colors, fontDisplay, fontBody, stickerShadow } from '../theme';

const navItems = [
  { label: 'Overview', path:'/dashboard', icon: Home, color: colors.coral },
  { label: 'Top Artists', path:'/top-artists', icon: Users, color: colors.sky },
  { label: 'Top Tracks', path:'/top-tracks', icon: ListMusic, color: colors.sunflower },
  { label: 'Genres', path:'/dashboard', icon: Disc3, color: colors.grape },
  { label: 'Statistics', path:'/stats', icon: Star, color: colors.mint },
   
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = React.useState(() =>
    location.pathname === '/stats' ? 'Statistics' :
    location.pathname === '/top-artists' ? 'Top Artists' :
    location.pathname === '/top-tracks' ? 'Top Tracks' : 'Overview'
  );
  return (
    <aside style={{
        backgroundColor: colors.panel,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
    }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px', marginBottom: 30 }}>
            <div style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: colors.sunflower,
                border: `2.5px solid ${colors.ink}`,
                boxShadow: stickerShadow(3),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: fontDisplay,
                fontWeight: 600,
                fontSize: 15,
                transform: 'rotate(-4deg)',
                flexShrink: 0,

            }}
            >
                ♪
            </div>

            <span style={{ color: colors.ink, fontFamily: fontDisplay, fontWeight: 600, fontSize: 18 }}>
                Name 6769
            </span>
        </div>

        <nav style ={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
        }}
        >
            {navItems.map(({ label, path, icon: Icon, color }) => {
                const isActive = activeItem === label;
                return (
                    <button
                        key={label}
                        onClick={() => { setActiveItem(label); navigate(path); }}
                        style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 15px',
                        borderRadius: 12,
                        border: `2.5px solid ${colors.ink}`,
                        backgroundColor: isActive ? color : 'transparent',
                        color: isActive ? colors.panel : colors.inkSoft,
                        fontFamily: fontBody,
                        fontWeight: isActive ? 800 : 700,
                        textAlign: 'left',
                        cursor: 'pointer',
                        width: '100%',
                        boxShadow: isActive ? stickerShadow(3) : 'none',
                        transform: isActive ? 'translate(-1px, -1px)' : 'none',
                        transition: 'transform 0.1s, box-shadow 0.1s, background-color 0.1s',

                    }}
                    onMouseEnter={(e) => {
                        if (!isActive) {
                            e.currentTarget.style.backgroundColor = colors.paper;
                        }}
                    }
                    onMouseLeave={(e) => {
                        if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    }
                    >
                    <Icon size={20} />
                    {label}
                </button>
                );
            })}
        </nav>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
           <div style={{ marginTop: 'auto', padding: '20px 0', borderTop: `1px solid ${colors.inkSoft}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button
                    style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                    borderRadius: 12, border: 'none', background: 'transparent',
                    color: colors.inkSoft, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    width: '100%', fontFamily: fontBody,
                }}
                >
                    <Settings size={17} strokeWidth={2.5} />
                        Settings
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px 2px' }}>
          <div
            style={{
              width: 30, height: 30, borderRadius: '50%',
              backgroundColor: colors.paper, border: `2.5px solid ${colors.ink}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <User size={14} color={colors.ink} strokeWidth={2.5} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: colors.ink, fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap', fontFamily: fontBody }}>
              Test
            </div>
            <div style={{ color: colors.inkSoft, fontSize: 11, fontWeight: 600 }}>Spotify account</div>
          </div>
        </div>

            </div>
        </div>
        
    </aside>


  );
}