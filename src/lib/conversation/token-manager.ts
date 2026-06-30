/**
 * Token Manager — tracks and estimates token usage for AI interactions.
 */

import type { InterviewContext } from './engine';
import { estimateContextTokens } from './engine';
import { estimatePromptTokens } from './prompt-engine';

export interface TokenUsage {
  /** Total tokens consumed in this session */
  consumed: number;
  /** Estimated remaining budget */
  remaining: number;
  /** Breakdown by category */
  breakdown: {
    systemPrompt: number;
    history: number;
    responses: number;
    feedback: number;
  };
  /** Estimated cost in USD */
  estimatedCost: number;
}

const TOKEN_BUDGET = 100_000; // Per session
const INPUT_COST_PER_1K = 0.005; // GPT-4o input
const OUTPUT_COST_PER_1K = 0.015; // GPT-4o output

export function createTokenManager(sessionId: string, ctx: InterviewContext) {
  let totalInputTokens = estimatePromptTokens(ctx);
  let totalOutputTokens = 0;

  return {
    /** Track input tokens from a new prompt */
    trackInput(tokenCount: number): void {
      totalInputTokens += tokenCount;
    },

    /** Track output tokens from an AI response */
    trackOutput(tokenCount: number): void {
      totalOutputTokens += tokenCount;
    },

    /** Get current usage snapshot */
    getUsage(): TokenUsage {
      const consumed = totalInputTokens + totalOutputTokens;
      return {
        consumed,
        remaining: TOKEN_BUDGET - consumed,
        breakdown: {
          systemPrompt: estimatePromptTokens(ctx),
          history: estimateContextTokens(ctx),
          responses: totalOutputTokens,
          feedback: 0, // Feedback runs separately
        },
        estimatedCost:
          (totalInputTokens / 1000) * INPUT_COST_PER_1K +
          (totalOutputTokens / 1000) * OUTPUT_COST_PER_1K,
      };
    },

    /** Check if we should trim context to stay within budget */
    shouldTrim(): boolean {
      return estimateContextTokens(ctx) > 4000; // 4k tokens = ~trim trigger
    },

    /** Get summary for logging */
    summarize(): string {
      const usage = this.getUsage();
      return [
        `[${sessionId}] Tokens: ${usage.consumed} consumed`,
        `Input: ${totalInputTokens} | Output: ${totalOutputTokens}`,
        `Cost: $${usage.estimatedCost.toFixed(4)}`,
        `Remaining: ${usage.remaining}`,
      ].join(' | ');
    },
  };
}

export type TokenManager = ReturnType<typeof createTokenManager>;
