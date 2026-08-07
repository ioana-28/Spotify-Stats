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
                backgroundColor: '#181818',
                color: '#fff',
             }}
            >
                <h1>Dashboard</h1>
            </div>
        </div>
    );
}