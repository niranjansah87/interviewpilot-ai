import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/route-helpers';
import { getSession } from '@/lib/api/get-session';
import { prisma } from '@/database/client';
import { NotFoundError } from '@/lib/errors';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    const { id } = await params;

    const interview = await prisma.interviewSession.findFirst({
      where: { id, userId: session.id },
    });

    if (!interview) throw new NotFoundError('Interview session', id);

    const entries = await prisma.transcriptEntry.findMany({
      where: { sessionId: id },
      orderBy: { createdAt: 'asc' },
    });

    return apiSuccess({
      sessionId: id,
      entries: entries.map((e) => ({
        id: e.id,
        role: e.role,
        content: e.content,
        createdAt: e.createdAt,
      })),
    });
  } catch (error) {
    return apiError(error);
  }
}
