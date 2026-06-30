import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/route-helpers';
import { getSession } from '@/lib/api/get-session';
import { prisma } from '@/database/client';
import { NotFoundError } from '@/lib/errors';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    const { id } = await params;

    const interview = await prisma.interviewSession.findFirst({
      where: { id, userId: session.id },
    });
    if (!interview) throw new NotFoundError('Interview session', id);

    const { role, content } = await req.json();
    if (!role || !content) return apiSuccess({ skipped: true });

    const entry = await prisma.transcriptEntry.create({
      data: {
        sessionId: id,
        role: role === 'candidate' ? 'CANDIDATE' : 'INTERVIEWER',
        content: String(content).slice(0, 5000),
      },
    });

    return apiSuccess(entry, 201);
  } catch (error) {
    return apiError(error);
  }
}

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
