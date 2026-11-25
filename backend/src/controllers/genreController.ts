import axios from "axios";
import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
import { getSessionUser } from "../lib/session.js";
import { getValidAccessToken, SpotifyAuthError } from "../lib/spotify.js";
import { resolveArtistGenres } from "../services/genreService.js";
import { toBroadGenre } from "../services/genreCategoryMapper.js";

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const getGenres = async (req: Request, res: Response) => {
    try {
        const user = await getSessionUser(req, prisma);

        if (!user) {
            return res
                .status(401)
                .json({ error: "No user found. Please log in first." });
        }

        const validTimeRanges = ["short_term", "medium_term", "long_term"];
        const timeRange = validTimeRanges.includes(
            req.query.timeRange as string,
        )
            ? (req.query.timeRange as string)
            : "short_term";

        const accessToken = await getValidAccessToken(user, prisma);
        const spotifyResponse = await axios.get(
            `https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${timeRange}`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            },
        );

        const spotifyArtists = spotifyResponse.data.items;
        const totalArtists = spotifyArtists.length;
        if (totalArtists === 0) {
            return res.json({ genres: [] });
        }

        const artistNames = spotifyArtists
            .map((artist: any) => String(artist.name ?? ""))
            .filter(Boolean);
        const resolved = await resolveArtistGenres(prisma, artistNames);

        type GenreData = {
            score: number;
            count: number;
            artists: string[];
        };

        const genreMap: Record<string, GenreData> = {};

        spotifyArtists.forEach((artist: any, index: number) => {
            const weight = totalArtists - index;
            const broadGenres = new Set(
                (resolved.get(artist.name)?.genres ?? [])
                    .map(toBroadGenre)
                    .filter((genre) => genre !== 'Other'),
            );

            broadGenres.forEach((genre) => {
                if (!genreMap[genre]) {
                    genreMap[genre] = { score: 0, count: 0, artists: [] };
                }
                genreMap[genre].score += weight;
                genreMap[genre].count += 1;
                if (!genreMap[genre].artists.includes(artist.name)) {
                    genreMap[genre].artists.push(artist.name);
                }
            });
        });

        const totalScore = Object.values(genreMap).reduce(
            (sum, genreData) => sum + genreData.score,
            0,
        );
        const topGenres = Object.entries(genreMap)
            .map(([genre, data]) => ({
                genre,
                score: data.score,
                percentage:
                    totalScore > 0
                        ? Math.round((data.score / totalScore) * 100)
                        : 0,
                count: data.count,
                topArtists: data.artists.slice(0, 3),
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        res.json({ genres: topGenres });
    } catch (error) {
        if (error instanceof SpotifyAuthError) {
            return res
                .status(401)
                .json({ error: "Session expired. Please log in again." });
        }
        console.error("Error fetching genre data:", error);
        return res.status(500).json({ error: "Failed to fetch genre data." });
    }
};
