import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import LogoutButton from '../components/LogoutButton';
import { Music, Disc, Tv, Mic } from 'lucide-react';
import { colors, fontDisplay, fontBody, stickerShadow } from '../theme';

type TabId = 'genres' | 'library';

interface LibrarySizes {
  tracks: number;
  albums: number;
  shows: number;
  episodes: number;
}

export default function Statistics() {
  const [activeTab, setActiveTab] = useState<TabId>('library');
  const [libraryData, setLibraryData] = useState<LibrarySizes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'library' && !libraryData) {
      setLoading(true);
      fetch('http://localhost:5000/api/stats', { credentials: 'include' })
        .then((res) => {
          if (res.status === 401) {
            window.location.href = '/login';
            return;
          }
          if (!res.ok) throw new Error('Failed to fetch library statistics');
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
    }
  }, [activeTab, libraryData]);

  const cards = [
    { title: 'Liked Songs', count: libraryData?.tracks ?? 0, icon: Music, color: colors.coral },
    { title: 'Saved Albums', count: libraryData?.albums ?? 0, icon: Disc, color: colors.sky },
    { title: 'Podcasts (Shows)', count: libraryData?.shows ?? 0, icon: Tv, color: colors.mint },
    { title: 'Saved Episodes', count: libraryData?.episodes ?? 0, icon: Mic, color: colors.sunflower },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.ink }}>
      <LogoutButton />
      <Sidebar />
      <main style={{ flex: 1, padding: '36px 40px', boxSizing: 'border-box', maxWidth: 920, margin: '0 auto' }}>
        
        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {[
            { id: 'library' as TabId, label: 'Library Size' },
            { id: 'genres' as TabId, label: 'Genres' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 14,
                  border: `2.5px solid ${colors.ink}`,
                  backgroundColor: isActive ? colors.sunflower : colors.panel,
                  color: colors.ink,
                  fontFamily: fontDisplay,
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: 'pointer',
                  boxShadow: isActive ? stickerShadow(3) : 'none',
                  transform: isActive ? 'translate(-1px, -1px)' : 'none',
                  transition: 'all 0.1s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Library Size View */}
        {activeTab === 'library' && (
          <section
            style={{
              backgroundColor: colors.panel,
              border: `2.5px solid ${colors.ink}`,
              borderRadius: 20,
              padding: 28,
              boxShadow: stickerShadow(4),
            }}
          >
            <h2 style={{ color: colors.ink, fontFamily: fontDisplay, fontSize: 24, fontWeight: 700, margin: '0 0 8px 0' }}>
              Your Library Overview
            </h2>
            <p style={{ color: colors.inkSoft, fontFamily: fontBody, fontSize: 14, fontWeight: 700, margin: '0 0 24px 0' }}>
              Total media currently saved to your Spotify account.
            </p>

            {loading && <p style={{ color: colors.inkSoft, fontWeight: 700 }}>Reading your library...</p>}
            {error && <p style={{ color: colors.coral, fontWeight: 700 }}>{error}</p>}

            {!loading && !error && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                {cards.map(({ title, count, icon: Icon, color }) => (
                  <div
                    key={title}
                    style={{
                      backgroundColor: colors.paper,
                      border: `2.5px solid ${colors.ink}`,
                      borderRadius: 16,
                      padding: '20px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
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
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 12,
                      }}
                    >
                      <Icon size={22} color={colors.ink} strokeWidth={2.5} />
                    </div>
                    <div style={{ fontFamily: fontDisplay, fontSize: 28, fontWeight: 800, color: colors.ink, marginBottom: 4 }}>
                      {count.toLocaleString()}
                    </div>
                    <div style={{ fontFamily: fontBody, fontSize: 13, fontWeight: 700, color: colors.inkSoft }}>
                      {title}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Existing Genres Placeholder View */}
        {activeTab === 'genres' && (
          <section
            style={{
              backgroundColor: colors.panel,
              border: `2.5px solid ${colors.ink}`,
              borderRadius: 20,
              padding: 24,
              boxShadow: stickerShadow(4),
            }}
          >
            <p style={{ color: colors.inkSoft, fontSize: 14 }}>No genres found.</p>
          </section>
        )}
      </main>
    </div>
  );
}