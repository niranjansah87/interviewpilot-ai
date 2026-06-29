/**
 * POST /api/v1/auth/register
 *
 * TODO: Implement in Phase 3 (Authentication feature).
 * This is a placeholder that returns 501.
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
