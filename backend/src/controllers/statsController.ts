import axios from 'axios';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
import { getSessionUser } from "../lib/session.js";

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const getLibrarySummary = async (req: Request, res: Response) => {
    try {
        const user = await getSessionUser(req, prisma);
        if (!user) {
            return res.status(401).json({ error: 'No user found. Please log in first.' });
        }

        const headers = { Authorization: `Bearer ${user.accessToken}` };
        
        const [tracksRes, albumsRes, showsRes, episodesRes] = await Promise.all([
            axios.get('https://api.spotify.com/v1/me/tracks?limit=1', { headers }),
            axios.get('https://api.spotify.com/v1/me/albums?limit=1', { headers }),
            axios.get('https://api.spotify.com/v1/me/shows?limit=1', { headers }),
            axios.get('https://api.spotify.com/v1/me/episodes?limit=1', { headers }),
        ]);

        return res.json({
            tracks: tracksRes.data.total ?? 0,
            albums: albumsRes.data.total ?? 0,
            shows: showsRes.data.total ?? 0,
            episodes: episodesRes.data.total ?? 0,
        });
    }
    catch (error) {
        console.error('Error fetching library summary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};