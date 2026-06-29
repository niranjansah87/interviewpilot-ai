/**
 * POST /api/v1/auth/login
 *
 * TODO: Implement in Phase 3 (Authentication feature).
 */

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      detail: 'Not yet implemented',
      code: 'NOT_IMPLEMENTED',
    },
    { status: 501 },
  );
}
