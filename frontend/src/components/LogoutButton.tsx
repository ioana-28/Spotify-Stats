import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LogOut } from 'lucide-react';
import styles from '../styles/LogoutButton.module.css';

export default function LogoutButton() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://127.0.0.1:5000/api/auth/logout', {
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
            className={styles.button}
            aria-label={loading ? 'Logging out' : 'Log out'}
            title={loading ? 'Logging out...' : 'Log out'}
            aria-busy={loading}
        >
            <LogOut size={18} strokeWidth={2.4} aria-hidden="true" />
        </button>
  )
}
