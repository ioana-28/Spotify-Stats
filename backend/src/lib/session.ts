import type { Request } from 'express';
import type { PrismaClient } from '@prisma/client';

export const SESSION_COOKIE = 'spotify_user_id';

export async function getSessionUser(req: Request, prisma: PrismaClient) {
  const userId = req.cookies?.[SESSION_COOKIE] as string | undefined;
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}
