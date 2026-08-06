import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';

export default function Dashboard() {
    const [status, setStatus] = useState('Authenticating...');

    
    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar />

            <div
             style={{
                flex: 1,
                padding: '20px',
                backgroundColor: '#181818',
                color: '#fff',
             }}
            >
                <p>Welcome to your Spotify Stats dashboard.</p>

                <h1>Dashboard</h1>
                <p>Here you can view your top tracks and artists.</p>
            </div>
        </div>
    );
}