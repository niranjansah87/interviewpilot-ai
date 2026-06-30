import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/route-helpers';
import { getSession } from '@/lib/api/get-session';
import { interviewService } from '@/services/interview.service';
import { prisma } from '@/database/client';
import { NotFoundError } from '@/lib/errors';

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
    if (body.status === 'COMPLETED') data.endedAt = new Date();
    if (body.status === 'ACTIVE') data.startedAt = data.startedAt ?? new Date();

    const updated = await prisma.interviewSession.update({
      where: { id },
      data,
    });

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
