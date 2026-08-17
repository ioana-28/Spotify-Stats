import type {Request, Response} from "express";
import axios from "axios";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const getDashboardData = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findFirst({
            orderBy: { createdAt: 'desc' },
        });

        if (!user) {
            return res.status(401).json({ error: 'No user found. Please log in first.' });
        }

        const timeRange = 'short_term';

        const [artistsResponse, tracksResponse] = await Promise.all([
            axios.get(`https://api.spotify.com/v1/me/top/artists?limit=3&time_range=${timeRange}`, {
                headers: { Authorization: `Bearer ${user.accessToken}` }
            }),
            axios.get(`https://api.spotify.com/v1/me/top/tracks?limit=3&time_range=${timeRange}`, {
                headers: { Authorization: `Bearer ${user.accessToken}` }
            })
        ]);

        const spotifyArtists = artistsResponse.data.items;
        const spotifyTracks = tracksResponse.data.items;

        const latestSnapshot = await prisma.snapshot.findFirst({
            where: { userId: user.id, timeRange },
            orderBy: { createdAt: 'desc' },
            include: {
                artists: { orderBy: { rank: 'asc' } },
                tracks: { orderBy: { rank: 'asc' } },
            },
        });
        
        let artistsChanged = !latestSnapshot || latestSnapshot.artists.length !== spotifyArtists.length;
        if (!artistsChanged && latestSnapshot) {
            artistsChanged = spotifyArtists.some((artist: any, index: number) => {
                const savedArtist = latestSnapshot.artists[index];
                return !savedArtist || savedArtist.spotifyId !== artist.id;
            });
        }

        let tracksChanged = !latestSnapshot || latestSnapshot.tracks.length !== spotifyTracks.length;
        if (!tracksChanged && latestSnapshot) {
            tracksChanged = spotifyTracks.some((track: any, index: number) => {
                const savedTrack = latestSnapshot.tracks[index];
                return !savedTrack || savedTrack.spotifyId !== track.id;
            });
        }

        let activeSnapshot = latestSnapshot;
        if (artistsChanged || tracksChanged || !latestSnapshot) {
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
                    tracks: {
                        create: spotifyTracks.map((track: any, index: number) => ({
                            spotifyId: track.id,
                            name: track.name,
                            artist: track.artists.map((a: any) => a.name).join(', '),
                            album: track.album.name,
                            imageUrl: track.album.images?.[0]?.url || null,
                            rank: index + 1,
                        })),
                    },
                },
                include: {
                    artists: { orderBy: { rank: 'asc' } },
                    tracks: { orderBy: { rank: 'asc' } },
                },
            });
        }

        res.json({
            artists: activeSnapshot?.artists || [],
            tracks: activeSnapshot?.tracks || [],
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};