import 'dotenv/config';
import crypto from 'crypto';
import axios from 'axios';
import type { Request, Response } from 'express';
import querystring from 'querystring';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
import {
  SESSION_COOKIE,
  OAUTH_STATE_COOKIE,
  getSessionUser,
} from '../lib/session.js';
import { encryptToken } from '../lib/crypto.js';

const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://127.0.0.1:5173';
const IS_SECURE = process.env.NODE_ENV === 'production';

function redirectWithError(res: Response, reason: string) {
  return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(reason)}`);
}

export const login = (req: Request, res: Response) => {
  const state = crypto.randomBytes(16).toString('hex');
  const scope = 'user-read-private user-read-email user-top-read user-read-currently-playing user-library-read';

  res.cookie(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: IS_SECURE,
    maxAge: 10 * 60 * 1000,
  });

  const queryParams = querystring.stringify({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: scope,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    state: state
  });
  
  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
};

export const callback = async (req: Request, res: Response) => {
  const stateCookie = req.cookies?.[OAUTH_STATE_COOKIE] as string | undefined;
  const stateQuery = req.query.state as string | undefined;

  res.clearCookie(OAUTH_STATE_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: IS_SECURE,
  });

  if (req.query.error) {
    return redirectWithError(res, String(req.query.error));
  }

  if (!stateCookie || !stateQuery || stateCookie !== stateQuery) {
    return res.status(400).send('Invalid OAuth state. Please start the login again.');
  }

  const code = req.query.code as string | undefined;
  if (!code) {
    return redirectWithError(res, 'missing_code');
  }

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI
      }), {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

    const { access_token, refresh_token, expires_in } = response.data;
    if (!refresh_token) {
      throw new Error('Spotify did not return a refresh token');
    }

    const userProfileResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    const { id, email, display_name, images } = userProfileResponse.data;
    const avatarUrl = images && images.length > 0 ? images[0].url : null;
    const expiresAt = new Date(
      Date.now() + (Number(expires_in) || 3600) * 1000,
    );
    const encryptedRefreshToken = encryptToken(refresh_token);

    await prisma.user.upsert({
      where: { id },
      update: {
        email,
        displayName: display_name,
        avatarUrl,
        accessToken: access_token,
        refreshToken: encryptedRefreshToken,
        expiresAt,
      },
      create: {
        id,
        email,
        displayName: display_name,
        avatarUrl,
        accessToken: access_token,
        refreshToken: encryptedRefreshToken,
        expiresAt,
      },
    });

    res.cookie(SESSION_COOKIE, id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: IS_SECURE,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      signed: true,
    });

    res.redirect(`${FRONTEND_URL}/dashboard`);
  } catch (error) {
    console.error('Authentication error:', error);
    return redirectWithError(res, 'authentication_failed');
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie(SESSION_COOKIE, {
      httpOnly: true,
      sameSite: 'lax',
      secure: IS_SECURE,
    });
    return res.status(200).send('Logged out successfully');
  }
  catch (error) {
    console.error('Logout error:', error);
    res.status(500).send('Logout failed');
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await getSessionUser(req, prisma);
    if (!user) {
      return res.status(401).json({ error: 'No user found. Please log in first.' });
    }
    return res.json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    });
  }
  catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
