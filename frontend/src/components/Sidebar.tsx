import React from 'react';
import { Home, Users, Disc3, ListMusic, Settings, User, Star } from 'lucide-react';

const colors = {
  paper: '#FFF6E9',
  panel: '#FFFFFF',
  ink: '#221F1A',
  inkSoft: '#6E685C',
  coral: '#FF6F5E',
  sunflower: '#FFC845',
  mint: '#3ED9A5',
  grape: '#A184E8',
  sky: '#5BB8F0',
}

const palette = [colors.coral, colors.mint, colors.grape, colors.sunflower, colors.sky];

const fontDisplay = "'Fredoka', ui-rounded, 'Segoe UI', sans-serif";
const fontBody = "'Nunito', ui-rounded, 'Segoe UI', sans-serif";

// Hard, un-blurred "sticker" shadow used everywhere for the comic feel
const stickerShadow = (offset = 4) => `${offset}px ${offset}px 0px ${colors.ink}`;

function FontImport() {
    return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@600;700;800&display=swap');
    `}</style>
  );
}

const navItems = [
  { label: 'Overview', icon: Home, color: colors.coral },
  { label: 'Top Artists', icon: Users, color: colors.mint },
  { label: 'Top Tracks', icon: ListMusic, color: colors.sunflower },
  { label: 'Genres', icon: Disc3, color: colors.grape },
  { label: 'Statistics', icon: Star, color: colors.sky },
   
];

export default function Sidebar() {
  const [activeItem, setActiveItem] = React.useState('Overview');  
  return (
    <aside style={{
        backgroundColor: colors.panel,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
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
                Your App Name
            </span>
        </div>

        <nav style ={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
        }}
        >
            {navItems.map(({ label, icon: Icon, color }) => {
                const isActive = activeItem === label;
                return (
                    <button
                        key={label}
                        onClick={() => setActiveItem(label)}
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
           <div style={{ marginTop: 'auto', padding: '20px 0', borderTop: `1px solid ${colors.inkSoft}`, display: 'flex', alignItems: 'center', gap: 10 }}>
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
              Placeholder User
            </div>
            <div style={{ color: colors.inkSoft, fontSize: 11, fontWeight: 600 }}>Spotify account</div>
          </div>
        </div>

            </div>
        </div>
        
    </aside>


  );
}