/**
 * POST /api/v1/voice/connect
 * Returns a signed WebSocket URL for ElevenLabs ConvAI.
 * Keeps the API key server-side — client gets only the signed URL.
 */

import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/route-helpers';
import { getSession } from '@/lib/api/get-session';
import { logger } from '@/monitoring/logger';

export async function POST(req: NextRequest) {
  try {
    await getSession(); // Auth required

    const body = await req.json().catch(() => ({}));
    const agentId = process.env.ELEVENLABS_AGENT_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!agentId || !apiKey) {
      return apiError(new Error('Voice provider not configured'));
    }

    // Build dynamic variables from request
    const dynamicVars: Record<string, string> = {};
    const safe = (v: string) => v?.replace(/[\x00-\x1f\x7f]/g, '').replace(/[^\w .,'\-+#/()&]/g, '').trim().slice(0, 100) ?? '';
    if (body.interview_type) dynamicVars.interview_type = safe(body.interview_type);
    if (body.role) dynamicVars.role = safe(body.role);
    if (body.level) dynamicVars.level = safe(body.level);

    const requestBody: Record<string, unknown> = {};
    if (Object.keys(dynamicVars).length > 0) {
      requestBody.conversation_config_override = {
        agent: {
          dynamic_variables: { dynamic_variable_placeholders: dynamicVars },
        },
      };
    }

    // Use GET for signed URL — POST with body returns 405
    const params = new URLSearchParams({ agent_id: agentId });
    const url = `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?${params}`;

    const signRes = await fetch(url, {
      headers: { 'xi-api-key': apiKey },
    });

    if (!signRes.ok) {
      const errBody = await signRes.json().catch(() => ({})) as { detail?: { message?: string } };
      const msg = errBody?.detail?.message ?? `ElevenLabs returned ${signRes.status}`;
      logger.error({ msg: 'Failed to get signed URL', status: signRes.status, detail: msg });
      return apiError(Object.assign(new Error(msg), { statusCode: 502 }));
    }

    const { signed_url } = await signRes.json() as { signed_url: string };
    return apiSuccess({
      signedUrl: signed_url,
      dynamicVars: Object.keys(dynamicVars).length > 0 ? dynamicVars : undefined,
    });
  } catch (error) {
    return apiError(error);
  }
}
