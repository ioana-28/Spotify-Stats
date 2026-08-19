import type { Request, Response } from "express";
import axios from "axios";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const getArtistGenres = async (artist: string): Promise<string[]> => {
    try {
        const response = await axios.get("https://ws.audioscrobbler.com/2.0/", {
            params: {
                method: "artist.gettoptags",
                artist: artist,
                api_key: process.env.LASTFM_API_KEY,
                format: "json",
                autocorrect: 1,
            },
            headers: {
                "User-Agent": "StatsApp/1.0.0", // Last.fm recommends including your app name
            },
            timeout: 5000,
        });

        const tags = response.data.toptags?.tag;
        if(!Array.isArray(tags)) {
            return [];
        }
        return tags.slice(0, 3).map((tag: any) => tag.name);
    }
    catch (error) {
        return [];
    }
}


export const getTopArtists = async (req: Request, res: Response) => {
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

        const response = await axios.get(`https://api.spotify.com/v1/me/top/artists?limit=10&time_range=${timeRange}`, {
            headers: { Authorization: `Bearer ${user.accessToken}` }
        });

        const spotifyArtists = response.data.items;

        const latestSnapshot = await prisma.snapshot.findFirst({
            where: { userId: user.id, timeRange },
            orderBy: { createdAt: 'desc' },
            include: {
                artists: {
                    orderBy: { rank: 'asc' },
                },
                tracks: {
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
                    ...(latestSnapshot?.tracks?.length
                        ? {
                              tracks: {
                                  create: latestSnapshot.tracks.map((track) => ({
                                      spotifyId: track.spotifyId,
                                      name: track.name,
                                      artist: track.artist,
                                      album: track.album,
                                      imageUrl: track.imageUrl,
                                      rank: track.rank,
                                  })),
                              },
                          }
                        : {}),
                },
                include: {
                    artists: {
                        orderBy: { rank: 'asc' },
                    },
                    tracks: {
                        orderBy: { rank: 'asc' },
                    },
                },
            });
        }

        res.json({ items: activeSnapshot?.artists || [] });
    }
    catch (error) {
        console.error('Error fetching and saving top artists:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
