import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/route-helpers';
import { getSession } from '@/lib/api/get-session';
import { feedbackService } from '@/services/feedback.service';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    const { id } = await params;
    const report = await feedbackService.getBySession(id, session.id);
    return apiSuccess(report);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    const { id } = await params;
    const report = await feedbackService.generate(id, session.id);
    return apiSuccess(report, 201);
  } catch (error) {
    return apiError(error);
  }
}
