import axios from 'axios';
import type { PrismaClient, User } from '@prisma/client';
import { decryptToken, encryptToken } from './crypto.js';

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const EXPIRY_BUFFER_MS = 60_000;
const DEFAULT_EXPIRES_IN_SECONDS = 3600;

export class SpotifyAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SpotifyAuthError';
  }
}

export async function getValidAccessToken(
  user: User,
  prisma: PrismaClient,
): Promise<string> {
  const expiresAt = user.expiresAt?.getTime() ?? 0;
  if (expiresAt - EXPIRY_BUFFER_MS > Date.now()) {
    return user.accessToken;
  }
  return refreshAccessToken(user, prisma);
}

async function refreshAccessToken(
  user: User,
  prisma: PrismaClient,
): Promise<string> {
  let refreshToken: string;
  try {
    refreshToken = decryptToken(user.refreshToken);
  } catch {
    throw new SpotifyAuthError('Stored refresh token could not be read');
  }

  try {
    const response = await axios.post(
      TOKEN_URL,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
      {
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(
              `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
            ).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const { access_token, expires_in, refresh_token } = response.data;
    const expiresIn = Number(expires_in) || DEFAULT_EXPIRES_IN_SECONDS;
    const nextRefreshToken =
      typeof refresh_token === 'string' && refresh_token.length > 0
        ? encryptToken(refresh_token)
        : user.refreshToken;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        accessToken: access_token,
        refreshToken: nextRefreshToken,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
      },
    });

    return access_token;
  } catch {
    throw new SpotifyAuthError('Failed to refresh Spotify access token');
  }
}
