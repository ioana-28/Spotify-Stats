import type {Request, Response} from "express";
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
import { getSessionUser } from '../lib/session.js';
import { getValidAccessToken, SpotifyAuthError } from '../lib/spotify.js';

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

        const [artistsSnapshot, tracksSnapshot] = await Promise.all([
            prisma.snapshot.findFirst({
                where: { userId: user.id, timeRange: 'short_term', artists: { some: {} } },
                orderBy: { createdAt: 'desc' },
                include: {
                    artists: { orderBy: { rank: 'asc' } },
                },
            }),
            prisma.snapshot.findFirst({
                where: { userId: user.id, timeRange: 'short_term', tracks: { some: {} } },
                orderBy: { createdAt: 'desc' },
                include: {
                    tracks: { orderBy: { rank: 'asc' } },
                },
            }),
        ]);

        res.json({
            artists: artistsSnapshot?.artists.slice(0, 3) || [],
            tracks: tracksSnapshot?.tracks.slice(0, 3) || [],
            artistsUpdatedAt: artistsSnapshot?.createdAt ?? null,
            tracksUpdatedAt: tracksSnapshot?.createdAt ?? null,
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

        const accessToken = await getValidAccessToken(user, prisma);

        const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing?additional_types=track,episode', {
            headers: { Authorization: `Bearer ${accessToken}` },
            validateStatus: (status) => status === 200 || status === 204,
        });

        if (response.status === 204 || !response.data) {
           return res.json({ isPlaying: false, progressMs: 0, type: 'track', track: null });
        }

        const playback = response.data;
        const item = playback.item;

        if (!item) {
            if (playback.currently_playing_type && playback.currently_playing_type !== 'unknown') {
                console.warn('[currently-playing] Spotify returned no item', {
                    currentlyPlayingType: playback.currently_playing_type,
                    contextType: playback.context?.type ?? null,
                });
            }
            return res.json({
                isPlaying: Boolean(playback.is_playing),
                progressMs: playback.progress_ms ?? 0,
                type: playback.currently_playing_type === 'episode' ? 'episode' : 'track',
                track: null,
            });
        }

        const isEpisode = item.type === 'episode';
        return res.json({
            isPlaying: playback.is_playing,
            progressMs: playback.progress_ms ?? 0,
            type: isEpisode ? 'episode' : 'track',
            track: {
                id: item.id,
                name: item.name,
                artist: isEpisode
                    ? (item.show?.name || 'Podcast')
                    : (item.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist'),
                album: isEpisode ? '' : (item.album?.name || ''),
                imageUrl: (isEpisode
                    ? (item.images?.[0]?.url ?? item.show?.images?.[0]?.url)
                    : item.album?.images?.[0]?.url) || null,
                durationMs: item.duration_ms ?? 0,
            },
        });
    }
    catch (error) {
        if (error instanceof SpotifyAuthError) {
            return res.status(401).json({ error: 'Session expired. Please log in again.' });
        }
        console.error('Error fetching currently playing track:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};