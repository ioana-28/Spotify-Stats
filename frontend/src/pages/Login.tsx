import React from 'react';

export default function SpotifyLogin() {
  const handleConnect = () => {
    // Redirects your app to the Express backend login route
    window.location.href = 'http://127.0.0.1:5000/api/auth/login';
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      backgroundColor: '#121212', 
      color: '#fff',
      fontFamily: 'sans-serif'
    }}>
      <h1>Spotify Stats App</h1>
      <p style={{ color: '#b3b3b3', marginBottom: '24px' }}>
        Connect your account to view your top tracks and artists.
      </p>
      
      <button 
        onClick={handleConnect}
        style={{
          backgroundColor: '#1DB954',
          color: 'white',
          padding: '14px 28px',
          fontSize: '16px',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '30px',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          boxShadow: '0 4px 12px rgba(29, 185, 84, 0.4)'
        }}
      >
        Connect with Spotify
      </button>
    </div>
  );
}