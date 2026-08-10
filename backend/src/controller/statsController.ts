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
        console.log('Retrieved user:', user);

        if (!user) {
            return res.status(401).json({ error: 'No user found. Please log in first.' });
        }

        const response = await axios.get('https://api.spotify.com/v1/me/top/artists?limit=10', {
            headers: { Authorization: `Bearer ${user.accessToken}` }
        });
        console.log('Top artists response:', response.data);
        const topArtists = response.data.items.map((artist: any) => ({
            id: artist.id,
            name: artist.name,
            image: artist.images,
            genres: artist.genres
        }));
        res.json({ items: topArtists });

        // const artist = response.data.items;
        // const snapshot = await prisma.snapshot.create({
        //     data: {
        //         userId: user.id,
        //         timeRange: 'medium_term',
        //     },
        // });

        // const artistData = artist.map((artist: any, index: number) =>
        //     prisma.topArtist.create({
        //         data: {
        //             snapshotId: snapshot.id,
        //             spotifyId: artist.id,
        //             name: artist.name,
        //             genres: artist.genres,
        //             imageUrl: artist.images?.[0]?.url || null,
        //             rank: index + 1,
        //         }
        //     })
        // );

        // await Promise.all(artistData);
        // const savedArtists = await prisma.topArtist.findMany({
        //     where: { snapshotId: snapshot.id },
        //     orderBy: { rank: 'asc' },
        // });

        // res.json({ items: savedArtists });
    }
    catch (error) {
        console.error('Error fetching top artists:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

