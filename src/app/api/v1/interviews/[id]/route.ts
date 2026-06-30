import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/route-helpers';
import { getSession } from '@/lib/api/get-session';
import { interviewService } from '@/services/interview.service';
import { prisma } from '@/database/client';
import { NotFoundError } from '@/lib/errors';
import { cache } from '@/cache/cache-manager';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    const { id } = await params;
    const interview = await interviewService.getById(id, session.id);
    return apiSuccess(interview);
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(
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

    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.status) data.status = body.status;
    if (body.durationSeconds != null) data.durationSeconds = body.durationSeconds;
    if (body.scheduledAt) data.scheduledAt = new Date(body.scheduledAt);
    if (body.status === 'COMPLETED') data.endedAt = new Date();
    if (body.status === 'ACTIVE') data.startedAt = new Date();
    if (body.status === 'CANCELLED') data.endedAt = new Date();

    const updated = await prisma.interviewSession.update({
      where: { id },
      data,
      include: { feedback: true },
    });

    // Invalidate caches
    await cache.delete(`ip:interview:${id}`);
    await cache.deletePattern(`ip:interview:list:${session.id}:*`);

    return apiSuccess(updated);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    const { id } = await params;
    const result = await interviewService.delete(id, session.id);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
