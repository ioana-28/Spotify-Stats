import type { Request, Response } from "express";
import axios from "axios";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
import { getArtistGenres } from "../services/lastFmService.js";
import { getSessionUser } from "../lib/session.js";
import { getValidAccessToken, SpotifyAuthError } from "../lib/spotify.js";

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });



export const getTopArtists = async (req: Request, res: Response) => {
    try {
        const user = await getSessionUser(req, prisma);

        if (!user) {
            return res.status(401).json({ error: 'No user found. Please log in first.' });
        }

        const validTimeRanges = ['short_term', 'medium_term', 'long_term'];
        const timeRange = validTimeRanges.includes(req.query.timeRange as string)
            ? (req.query.timeRange as string)
            : 'short_term';

        const accessToken = await getValidAccessToken(user, prisma);
        const response = await axios.get(`https://api.spotify.com/v1/me/top/artists?limit=10&time_range=${timeRange}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const spotifyArtists = response.data.items;

        const latestSnapshot = await prisma.snapshot.findFirst({
            where: { userId: user.id, timeRange, artists: { some: {} } },
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
            const enrichedArtists = await Promise.all(
                spotifyArtists.map(async (artist: any, index: number) => {
                    let genres = Array.isArray(artist.genres) && artist.genres.length > 0
                        ? artist.genres
                        : await getArtistGenres(artist.name);

                    return {
                        spotifyId: artist.id,
                        name: artist.name,
                        genres: genres,
                        imageUrl: artist.images?.[0]?.url || null,
                        rank: index + 1,
                    };
                })
            );
            activeSnapshot = await prisma.snapshot.create({
                data: {
                    userId: user.id,
                    timeRange,
                    artists: {
                        create: enrichedArtists,
                    },
                },
                include: {
                    artists: {
                        orderBy: { rank: 'asc' },
                    },
                },
            });
        }

        res.json({ items: activeSnapshot?.artists || [] });
    }
    catch (error) {
        if (error instanceof SpotifyAuthError) {
            return res.status(401).json({ error: 'Session expired. Please log in again.' });
        }
        console.error('Error fetching and saving top artists:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
