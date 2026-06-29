/**
 * GET /api/v1/interviews/:id
 * PATCH /api/v1/interviews/:id
 * DELETE /api/v1/interviews/:id
 *
 * TODO: Implement in Phase 3.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { detail: 'Not yet implemented', code: 'NOT_IMPLEMENTED' },
    { status: 501 },
  );
}

export async function PATCH() {
  return NextResponse.json(
    { detail: 'Not yet implemented', code: 'NOT_IMPLEMENTED' },
    { status: 501 },
  );
}

export async function DELETE() {
  return NextResponse.json(
    { detail: 'Not yet implemented', code: 'NOT_IMPLEMENTED' },
    { status: 501 },
  );
}
