import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.js';
import topArtistsRoutes from './routes/topArtists.js';
import topTracksRoutes from './routes/topTracks.js';
import dashboardRoutes from './routes/dashboard.js';
import genreRoutes from './routes/genre.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/top-artists', topArtistsRoutes);
app.use('/api/top-tracks', topTracksRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/genres', genreRoutes);
app.get('/', (req, res) => {
    res.send('Spotify Stats Backend is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
