import type { Request, Response } from "express";
import axios from "axios";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const getTopTracks = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findFirst({
            orderBy: { createdAt: 'desc' },
        });

        if (!user) {
            return res.status(401).json({ error: 'No user found. Please log in first.' });
        }

        const validTimeRanges = ['short_term', 'medium_term', 'long_term'];
        const timeRange = validTimeRanges.includes(req.query.timeRange as string)
            ? (req.query.timeRange as string)
            : 'short_term';

        const response = await axios.get(`https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=${timeRange}`, {
            headers: { Authorization: `Bearer ${user.accessToken}` }
        });

        const spotifyTracks = response.data.items;

        const latestSnapshot = await prisma.snapshot.findFirst({
            where: { userId: user.id, timeRange },
            orderBy: { createdAt: 'desc' },
            include: {
                tracks: {
                    orderBy: { rank: 'asc' },
                },
            },
        });

        let isSnapshotChanged = false;
        if (!latestSnapshot) {
            isSnapshotChanged = true;
        }
        else if(latestSnapshot.tracks.length !== spotifyTracks.length) {
            isSnapshotChanged = true;
        }
        else {
            isSnapshotChanged = spotifyTracks.some((track: any, index: number) => {
                const savedTrack = latestSnapshot.tracks[index];
                return !savedTrack || savedTrack.spotifyId !== track.id;
            });
        }

        let activeSnapshot = latestSnapshot;
        if (isSnapshotChanged) {
            activeSnapshot = await prisma.snapshot.create({
                data: {
                    userId: user.id,
                    timeRange,
                    tracks: {
                        create: spotifyTracks.map((track: any, index: number) => ({
                            spotifyId: track.id,
                            name: track.name,
                            artist: track.artists.map((artist: any) => artist.name).join(', '),
                            album: track.album.name,
                            imageUrl: track.album.images?.[0]?.url || null,
                            rank: index + 1,
                        })),
                    },
                },
                include: {
                    tracks: {
                        orderBy: { rank: 'asc' },
                    },
                },
            });
        }

        res.json({ items: activeSnapshot?.tracks || [] });
    }
    catch (error) {
        console.error('Error fetching and saving top tracks:', error);
        res.status(500).json({ error: 'Internal server error' });   
    }
};
