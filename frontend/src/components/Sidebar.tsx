import React from 'react';
import { Home, Users, Disc3, ListMusic, Clock, Settings, User, Star } from 'lucide-react';

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
  { label: 'Listening Time', icon: Clock, color: colors.sky },
];

export default function Sidebar() {
  const [activeItem, setActiveItem] = React.useState('Overview');  
  return (
    <aside style={{
        width: 250,
        backgroundColor: colors.panel,
        padding: '20px',
    }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px', marginBottom: 30 }}>
            <div style={{
                display: 'flex',
                backgroundColor: colors.sunflower,
                alignItems: 'center',
                gap: 10,
                padding: '10px 0',
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
                        backgroundColor: isActive ? color : 'transparent',
                        color: isActive ? colors.panel : colors.inkSoft,
                        border: 'none',
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

    </aside>
  );
}