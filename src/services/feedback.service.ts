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

    if (session.transcript.length === 0) {
      throw Object.assign(new Error('No transcript available for this session'), { statusCode: 422 });
    }

    // Build transcript text
    const transcriptText = session.transcript
      .map((e) => `${e.role === 'INTERVIEWER' ? 'Interviewer' : 'Candidate'}: ${e.content}`)
      .join('\n\n');

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw Object.assign(new Error('OPENAI_API_KEY not configured'), { statusCode: 503 });
    }

    log.info({ msg: 'Generating feedback', sessionId, turns: session.transcript.length });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert interview coach. Analyze the interview transcript and provide structured feedback.
Return ONLY a valid JSON object (no markdown, no code fences):

{
  "overallScore": 0-100,
  "communicationScore": 0-100,
  "confidenceScore": 0-100,
  "technicalReasoning": 0-100 or null (null if behavioral interview),
  "strengths": ["specific strength with example from transcript", ...],
  "weaknesses": ["specific weakness with suggestion", ...],
  "improvements": ["actionable improvement tip", ...],
  "summary": "2-3 sentence overall assessment"
}

Rules:
- Scores must reflect actual performance, not generic numbers
- Strengths and weaknesses must reference specific moments from the transcript
- Be constructive but honest — flattery doesn't help candidates improve
- Limit to 4 items each for strengths, weaknesses, improvements
- Summary should be under 200 characters`,
          },
          {
            role: 'user',
            content: `Interview type: ${session.type}\nTarget role: ${session.targetRole ?? 'General'}\nLevel: ${session.experienceLevel ?? 'Not specified'}\n\nTranscript:\n${transcriptText.slice(0, 12000)}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
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
