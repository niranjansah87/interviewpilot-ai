/**
 * GET  /api/v1/users/me/resume — fetch saved resume text
 * POST /api/v1/users/me/resume — save resume text
 */

import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/route-helpers';
import { getSession } from '@/lib/api/get-session';
import { prisma } from '@/database/client';

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    const resume = await prisma.resume.findUnique({ where: { userId: session.id } });

    if (!resume) {
      return apiSuccess({ text: '', fullName: null });
    }

    return apiSuccess({
      text: resume.rawText,
      fullName: resume.fullName,
      updatedAt: resume.updatedAt,
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const { text, fullName } = await req.json();

    if (!text || typeof text !== 'string' || text.length < 50) {
      return apiError(
        Object.assign(new Error('Resume text must be at least 50 characters'), { statusCode: 422 }),
      );
    }

    const resume = await prisma.resume.upsert({
      where: { userId: session.id },
      create: {
        userId: session.id,
        rawText: text.slice(0, 10000),
        fullName: fullName?.slice(0, 255) ?? null,
        skills: [],
        experience: [],
        education: [],
        projects: [],
      },
      update: {
        rawText: text.slice(0, 10000),
        fullName: fullName?.slice(0, 255) ?? null,
      },
    });

    return apiSuccess({ id: resume.id, updatedAt: resume.updatedAt }, 201);
  } catch (error) {
    return apiError(error);
  }
}
