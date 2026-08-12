import type { Request, Response } from "express";
import axios from "axios";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const getTopArtists = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findFirst({
            orderBy: { createdAt: 'desc' },
        });

        if (!user) {
            return res.status(401).json({ error: 'No user found. Please log in first.' });
        }

        const response = await axios.get('https://api.spotify.com/v1/me/top/artists?limit=10', {
            headers: { Authorization: `Bearer ${user.accessToken}` }
        });

        const spotifyArtists = response.data.items;
        const timeRange = 'medium_term';

        const latestSnapshot = await prisma.snapshot.findFirst({
            where: { userId: user.id, timeRange },
            orderBy: { createdAt: 'desc' },
            include: {
                artists: {
                    orderBy: { rank: 'asc' },
                },
            },
        });

        let isSnapshotChanged = true;
        if (!latestSnapshot) {
            isSnapshotChanged = true;
        }
        else if(latestSnapshot.artists.length !== spotifyArtists.length) {
            isSnapshotChanged = true;
        }
        else {
            isSnapshotChanged = spotifyArtists.some((artist: any, index: number) => {
                const savedArtist = latestSnapshot.artists[index];
                return !savedArtist || savedArtist.spotifyId !== artist.id;
            });
        }

        let activeSnapshot = latestSnapshot;

        if (isSnapshotChanged) {
            activeSnapshot = await prisma.snapshot.create({
                data: {
                    userId: user.id,
                    timeRange,
                    artists: {
                        create: spotifyArtists.map((artist: any, index: number) => ({
                            spotifyId: artist.id,
                            name: artist.name,
                            genres: artist.genres,
                            imageUrl: artist.images?.[0]?.url || null,
                            rank: index + 1,
                        })),
                    },
                },
                include: {
                    artists: {
                        orderBy: { rank: 'asc' },
                    },
                },
            });
        }

        // Return the artists from the active (latest or newly created) snapshot
        res.json({ items: activeSnapshot?.artists || [] });
    }
    catch (error) {
        console.error('Error fetching and saving top artists:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};