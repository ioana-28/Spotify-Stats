import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { colors, fontDisplay, stickerShadow } from '../theme';

export default function Statistics() {
    const [activeTab, setActiveTab] = useState<'genres'>('genres');

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{ flex: 1, padding: '36px 40px', boxSizing: 'border-box', maxWidth: 920, margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                    {[
                        { id: 'genres', label: 'Genres' },
                    ].map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
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

                {activeTab === 'genres' && (
                    <section style={{
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
