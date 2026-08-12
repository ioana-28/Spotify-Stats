import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';


const fontDisplay = "'Fredoka', ui-rounded, 'Segoe UI', sans-serif";
const fontBody = "'Nunito', ui-rounded, 'Segoe UI', sans-serif";

export default function Dashboard() {
    const [status, setStatus] = useState('Authenticating...');

    
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
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