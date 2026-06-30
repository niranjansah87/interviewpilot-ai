/**
 * POST /api/v1/voice/connect
 * Returns a signed WebSocket URL for ElevenLabs ConvAI.
 * Uses weighted-random agent pool with circuit breaker failover.
 */

import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/route-helpers';
import { getSession } from '@/lib/api/get-session';
import { logger } from '@/monitoring/logger';
import { selectAgent, reportSuccess, reportFailure } from '@/lib/ai/agent-pool';

export async function POST(req: NextRequest) {
  try {
    await getSession();

    const agent = selectAgent();
    if (!agent) {
      return apiError(new Error('Voice provider not configured'));
    }

    const body = await req.json().catch(() => ({}));

    const dynamicVars: Record<string, string> = {};
    const safe = (v: string) => v?.replace(/[\x00-\x1f\x7f]/g, '').replace(/[^\w .,'\-+#/()&]/g, '').trim().slice(0, 100) ?? '';
    if (body.interview_type) dynamicVars.interview_type = safe(body.interview_type);
    if (body.role) dynamicVars.role = safe(body.role);
    if (body.level) dynamicVars.level = safe(body.level);
    if (body.candidate_name) dynamicVars.candidate_name = safe(body.candidate_name);
    if (body.resume_context) dynamicVars.resume_context = body.resume_context.slice(0, 3000);

    // Try selected agent, fall back through pool on failure
    const pool = [agent]; // We'll retry with different agents if needed
    let lastError: string | null = null;

    // We use the pool singleton — retry up to 3 times with different agents
    for (let attempt = 0; attempt < 3; attempt++) {
      const currentAgent = attempt === 0 ? agent : selectAgent();
      if (!currentAgent) break;
      // Skip if same agent that already failed
      if (attempt > 0 && currentAgent.id === agent.id) continue;

      try {
        const params = new URLSearchParams({ agent_id: currentAgent.id });
        const url = `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?${params}`;
        const signRes = await fetch(url, { headers: { 'xi-api-key': currentAgent.key } });

        if (!signRes.ok) {
          const errBody = await signRes.json().catch(() => ({})) as { detail?: { message?: string } };
          const msg = errBody?.detail?.message ?? `ElevenLabs returned ${signRes.status}`;
          logger.warn({ msg: `Agent ${currentAgent.label} failed`, status: signRes.status, detail: msg });
          reportFailure(currentAgent.id);
          lastError = msg;
          continue;
        }

        const { signed_url } = await signRes.json() as { signed_url: string };
        reportSuccess(currentAgent.id);
        logger.info({ msg: `Voice session via ${currentAgent.label}`, agentId: currentAgent.id });

        return apiSuccess({
          signedUrl: signed_url,
          agent: currentAgent.label,
          dynamicVars: Object.keys(dynamicVars).length > 0 ? dynamicVars : undefined,
        });
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        reportFailure(currentAgent.id);
        logger.warn({ msg: `Agent ${currentAgent.label} error`, error: lastError });
      }
    }

    return apiError(Object.assign(new Error(lastError ?? 'All voice providers unavailable'), { statusCode: 502 }));
  } catch (error) {
    return apiError(error);
  }
}
