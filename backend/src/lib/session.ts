import type { Request } from 'express';
import type { PrismaClient } from '@prisma/client';

export const SESSION_COOKIE = 'spotify_user_id';
export const OAUTH_STATE_COOKIE = 'spotify_oauth_state';

export async function getSessionUser(req: Request, prisma: PrismaClient) {
  const userId = req.signedCookies?.[SESSION_COOKIE] as string | undefined;
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}
