import { useNavigate } from 'react-router-dom';
import { colors, fontDisplay, stickerShadow } from '../theme';
import { useState } from 'react';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Logout failed');
            }
            console.log('Logged out successfully');
            navigate('/login');
        }
        catch (error) {
            console.error('Logout error:', error);
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            style={{
                position: 'fixed',
                top: 20,
                right: 24,
                zIndex: 1000,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                backgroundColor: colors.coral,
                color: colors.ink,
                fontFamily: fontDisplay,
                fontWeight: 600,
                fontSize: 14,
                border: `2px solid ${colors.ink}`,
                borderRadius: 999,
                boxShadow: stickerShadow(3),
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            }}

            onMouseEnter={(e) => {
                if (!loading) {
                    e.currentTarget.style.transform = 'translate(-1px, -1px)';
                    e.currentTarget.style.boxShadow = stickerShadow(4);
                }
            }}
            onMouseLeave={(e) => {
                if (!loading) {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = stickerShadow(3);
                }
            }}
        >
            <LogOut size={16} strokeWidth={2.4} />
            <span>{loading ? 'Logging out...' : 'Log out'}</span>
        </button>
  )
}