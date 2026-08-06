import 'dotenv/config';
import axios from 'axios';
import type { Request, Response } from 'express';
import querystring from 'querystring';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const login = (req: Request, res: Response) => {
  const state = Math.random().toString(36).substring(7);
  const scope = 'user-read-private user-read-email user-top-read';
  
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

    res.redirect('http://localhost:5173/dashboard');
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).send('Authentication failed');
  }
};