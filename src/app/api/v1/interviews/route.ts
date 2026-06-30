import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/route-helpers';
import { getSession } from '@/lib/api/get-session';
import { interviewService } from '@/services/interview.service';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const interview = await interviewService.create({
      userId: session.id,
      type: body.type ?? 'BEHAVIORAL',
      targetRole: body.targetRole,
      experienceLevel: body.experienceLevel,
      status: body.scheduledAt ? ('SCHEDULED' as const) : undefined,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
    });
    return apiSuccess(interview, 201);
  } catch (error) {
    return apiError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') ?? '1', 10);
    const limit = parseInt(url.searchParams.get('limit') ?? '10', 10);
    const result = await interviewService.list(session.id, page, limit);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
