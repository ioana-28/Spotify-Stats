import type {Request, Response} from "express";
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