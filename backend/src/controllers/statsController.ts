import axios from "axios";
import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
import { getSessionUser } from "../lib/session.js";
import {
    analyzeEras,
    eraDistributionKey,
    ERA_BUCKETS,
} from "../services/eraService.js";
import type { EraAnalysis, EraBucket } from "../services/eraService.js";

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const TIME_RANGES = ["short_term", "medium_term", "long_term"] as const;

interface StoredEra {
    decade: string;
    count: number;
    score: number;
}

function storedDistributionKey(eras: StoredEra[]): string {
    const byDecade = new Map(eras.map((era) => [era.decade, era]));
    return ERA_BUCKETS.map((decade) => {
        const era = byDecade.get(decade);
        return `${decade}:${era?.count ?? 0}:${era?.score ?? 0}`;
    }).join("|");
}

export const getLibrarySummary = async (req: Request, res: Response) => {
    try {
        const user = await getSessionUser(req, prisma);
        if (!user) {
            return res
                .status(401)
                .json({ error: "No user found. Please log in first." });
        }

        const headers = { Authorization: `Bearer ${user.accessToken}` };

        const [tracksRes, albumsRes, showsRes, episodesRes] = await Promise.all(
            [
                axios.get("https://api.spotify.com/v1/me/tracks?limit=1", {
                    headers,
                }),
                axios.get("https://api.spotify.com/v1/me/albums?limit=1", {
                    headers,
                }),
                axios.get("https://api.spotify.com/v1/me/shows?limit=1", {
                    headers,
                }),
                axios.get("https://api.spotify.com/v1/me/episodes?limit=1", {
                    headers,
                }),
            ],
        );

        return res.json({
            tracks: tracksRes.data.total ?? 0,
            albums: albumsRes.data.total ?? 0,
            shows: showsRes.data.total ?? 0,
            episodes: episodesRes.data.total ?? 0,
        });
    } catch (error) {
        console.error("Error fetching library summary:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getTimeCapsule = async (req: Request, res: Response) => {
    try {
        const user = await getSessionUser(req, prisma);
        if (!user) {
            return res
                .status(401)
                .json({ error: "No user found. Please log in first." });
        }

        const headers = { Authorization: `Bearer ${user.accessToken}` };

        const responses = await Promise.all(
            TIME_RANGES.map((timeRange) =>
                axios.get(
                    `https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${timeRange}`,
                    { headers },
                ),
            ),
        );

        const analysis: EraAnalysis = analyzeEras(
            responses.map((response) => ({
                items: response.data.items ?? [],
            })),
        );

        const latest = await prisma.eraSnapshot.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            include: { eras: true },
        });

        const hasChanged =
            !latest ||
            storedDistributionKey(latest.eras) !== eraDistributionKey(analysis);

        let active = latest;
        if (hasChanged) {
            active = await prisma.eraSnapshot.create({
                data: {
                    userId: user.id,
                    tracksAnalyzed: analysis.tracksAnalyzed,
                    dominantDecade: analysis.dominantDecade ?? "Unknown",
                    eras: {
                        create: analysis.eras.map((era) => ({
                            decade: era.decade,
                            count: era.count,
                            score: era.score,
                        })),
                    },
                },
                include: { eras: true },
            });
        }

        return res.json({
            dominantDecade: analysis.dominantDecade,
            tracksAnalyzed: analysis.tracksAnalyzed,
            eras: analysis.eras,
            changedFrom: hasChanged ? (latest?.dominantDecade ?? null) : null,
            createdAt: active?.createdAt ?? null,
        });
    } catch (error) {
        console.error("Error building time capsule:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getEraHistory = async (req: Request, res: Response) => {
    try {
        const user = await getSessionUser(req, prisma);
        if (!user) {
            return res
                .status(401)
                .json({ error: "No user found. Please log in first." });
        }

        const snapshots = await prisma.eraSnapshot.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            take: 50,
            include: { eras: true },
        });

        const history = snapshots
            .reverse()
            .map((snapshot) => ({
                id: snapshot.id,
                createdAt: snapshot.createdAt,
                dominantDecade: snapshot.dominantDecade,
                tracksAnalyzed: snapshot.tracksAnalyzed,
                eras: snapshot.eras
                    .slice()
                    .sort(
                        (a, b) =>
                            ERA_BUCKETS.indexOf(a.decade as EraBucket) -
                            ERA_BUCKETS.indexOf(b.decade as EraBucket),
                    )
                    .map((era) => ({
                        decade: era.decade,
                        count: era.count,
                        score: era.score,
                    })),
            }));

        return res.json({ history });
    } catch (error) {
        console.error("Error fetching era history:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
