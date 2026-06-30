/**
 * Feedback service — generates interview analysis using GPT-4.
 */

import { prisma } from '@/database/client';
import { logger } from '@/monitoring/logger';
import { NotFoundError } from '@/lib/errors';

const log = logger.child({ service: 'feedback' });

interface FeedbackResult {
  overallScore: number;
  communicationScore: number;
  confidenceScore: number;
  technicalReasoning: number | null;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  summary: string;
}

export const feedbackService = {
  async generate(sessionId: string, userId: string): Promise<FeedbackResult> {
    // Verify session exists and belongs to user
    const session = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
      include: { transcript: { orderBy: { createdAt: 'asc' } } },
    });

    if (!session) throw new NotFoundError('Interview session', sessionId);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw Object.assign(new Error('OPENAI_API_KEY not configured'), { statusCode: 503 });
    }

    const hasTranscript = session.transcript.length > 0;
    const transcriptText = hasTranscript
      ? session.transcript.map((e) => `${e.role === 'INTERVIEWER' ? 'Interviewer' : 'Candidate'}: ${e.content}`).join('\n\n')
      : '';

    log.info({ msg: 'Generating feedback', sessionId, hasTranscript, turns: session.transcript.length });

    const systemPrompt = hasTranscript
      ? `You are an expert interview coach. Analyze the interview transcript and provide structured feedback. Return ONLY valid JSON (no markdown). Format: {"overallScore":0-100,"communicationScore":0-100,"confidenceScore":0-100,"technicalReasoning":0-100|null,"strengths":["..."],"weaknesses":["..."],"improvements":["..."],"summary":"..."}. Reference specific moments. Be constructive. 4 items max each. Summary under 200 chars.`
      : `You are an expert interview coach. Based on the interview metadata provided (no transcript available), generate a reasonable feedback report. Return ONLY valid JSON: {"overallScore":0-100,"communicationScore":0-100,"confidenceScore":0-100,"technicalReasoning":0-100|null,"strengths":["general interview strengths"],"weaknesses":["general areas to improve"],"improvements":["actionable tips"],"summary":"brief overall note mentioning that this is estimated feedback"}. Be realistic. 4 items max each.`;

    const userContent = hasTranscript
      ? `Type: ${session.type}\nRole: ${session.targetRole ?? 'General'}\nLevel: ${session.experienceLevel ?? 'Not specified'}\nDuration: ${session.durationSeconds ?? '?'}s\n\nTranscript:\n${transcriptText.slice(0, 12000)}`
      : `Type: ${session.type}\nRole: ${session.targetRole ?? 'General'}\nLevel: ${session.experienceLevel ?? 'Not specified'}\nDuration: ${session.durationSeconds ?? '?'}s\n\nNo transcript available. Provide estimated feedback based on interview metadata.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      log.error({ msg: 'OpenAI feedback API error', status: response.status });
      throw Object.assign(new Error('AI feedback service unavailable'), { statusCode: 502 });
    }

    const data = (await response.json()) as {
      choices: [{ message: { content: string } }];
    };

    const raw = data.choices[0]?.message?.content ?? '';
    const json = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    let feedback: FeedbackResult;
    try {
      feedback = JSON.parse(json) as FeedbackResult;
    } catch {
      log.error({ msg: 'Failed to parse feedback JSON', raw: json.slice(0, 500) });
      throw Object.assign(new Error('Failed to parse AI feedback'), { statusCode: 500 });
    }

    // Store in DB
    await prisma.feedbackReport.upsert({
      where: { sessionId },
      create: {
        sessionId,
        overallScore: feedback.overallScore,
        communicationScore: feedback.communicationScore,
        confidenceScore: feedback.confidenceScore,
        technicalReasoning: feedback.technicalReasoning,
        strengths: feedback.strengths,
        weaknesses: feedback.weaknesses,
        improvements: feedback.improvements,
        summary: feedback.summary,
      },
      update: {
        overallScore: feedback.overallScore,
        communicationScore: feedback.communicationScore,
        confidenceScore: feedback.confidenceScore,
        technicalReasoning: feedback.technicalReasoning,
        strengths: feedback.strengths,
        weaknesses: feedback.weaknesses,
        improvements: feedback.improvements,
        summary: feedback.summary,
      },
    });

    log.info({ msg: 'Feedback generated', sessionId, score: feedback.overallScore });
    return feedback;
  },

  async getBySession(sessionId: string, userId: string) {
    const session = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
      include: { feedback: true },
    });

    if (!session) throw new NotFoundError('Interview session', sessionId);
    if (!session.feedback) throw new NotFoundError('Feedback report');

    return session.feedback;
  },
};
