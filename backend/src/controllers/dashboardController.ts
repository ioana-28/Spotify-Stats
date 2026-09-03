import type {Request, Response} from "express";
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
import { getSessionUser } from '../lib/session.js';

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const getDashboardData = async (req: Request, res: Response) => {
    try {
        const user = await getSessionUser(req, prisma);

        if (!user) {
            return res.status(401).json({ error: 'No user found. Please log in first.' });
        }

        const latestSnapshot = await prisma.snapshot.findFirst({
            where: { userId: user.id, timeRange: 'short_term' },
            orderBy: { createdAt: 'desc' },
            include: {
                artists: { orderBy: { rank: 'asc' } },
                tracks: { orderBy: { rank: 'asc' } },
            },
        });

        res.json({
            artists: latestSnapshot?.artists.slice(0, 3) || [],
            tracks: latestSnapshot?.tracks.slice(0, 3) || [],
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getCurrentlyPlayingTrack = async (req: Request, res: Response) => {
    try {
        const user = await getSessionUser(req, prisma);
        if (!user) {
            return res.status(401).json({ error: 'No user found. Please log in first.' });
        }

        const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: { Authorization: `Bearer ${user.accessToken}` },
            validateStatus: (status) => status === 200 || status === 204,
        });

        if (response.status === 204 || !response.data || !response.data.item) {
           return res.json({ isPlaying: false, track: null });
        }

        const item = response.data.item;
        return res.json({
            isPlaying: response.data.is_playing,
            progressMs: response.data.progress_ms,
            track: {
                id: item.id,
                name: item.name,
                artist: item.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist',
                album: item.album?.name || '',
                imageUrl: item.album?.images?.[0]?.url || null,
                durationMs: item.duration_ms,
            },
        });
    }
    catch (error) {
        console.error('Error fetching currently playing track:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};