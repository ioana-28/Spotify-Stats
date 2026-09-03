import 'dotenv/config';
import axios from 'axios';
import type { Request, Response } from 'express';
import querystring from 'querystring';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
import { SESSION_COOKIE, getSessionUser } from '../lib/session.js';

const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const login = (req: Request, res: Response) => {
  const state = Math.random().toString(36).substring(7);
  const scope = 'user-read-private user-read-email user-top-read user-read-currently-playing';
  
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
  const code = req.query.code as string;
  
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

    const { access_token, refresh_token } = response.data;
    const userProfileResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    const { id, email, display_name, images } = userProfileResponse.data;
    const avatarUrl = images && images.length > 0 ? images[0].url : null;

    await prisma.user.upsert({
      where: { id },
      update: {
        email,
        displayName: display_name,
        avatarUrl,
        accessToken: access_token,
        refreshToken: refresh_token,
      },
      create: {
        id,
        email,
        displayName: display_name,
        avatarUrl,
        accessToken: access_token,
        refreshToken: refresh_token,
      },
    });

    res.redirect(`http://localhost:5000/api/auth/session?userId=${encodeURIComponent(id)}`);
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).send('Authentication failed');
  }
};

export const establishSession = (req: Request, res: Response) => {
  const userId = req.query.userId as string;

  if (!userId) {
    return res.status(400).send('Missing user id');
  }

  res.cookie(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.redirect('http://localhost:5173/dashboard');
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: 'lax', secure: false });
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
