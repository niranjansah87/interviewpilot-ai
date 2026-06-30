/**
 * Production Prompt Library — version-tracked, composable interview prompts.
 * Each prompt is a named, versioned module for future A/B testing.
 */

import { INTERVIEWER_PERSONA, INTERVIEWER_CLOSING } from './interviewer-persona';
import { BEHAVIORAL_PROMPT } from './behavioral';
import { TECHNICAL_PROMPT } from './technical';
import { SYSTEM_DESIGN_PROMPT } from './system-design';
import { FRONTEND_PROMPT } from './frontend';
import { BACKEND_PROMPT } from './backend';
import { FULLSTACK_PROMPT } from './fullstack';
import { DEVOPS_PROMPT } from './devops';
import { FEEDBACK_ANALYSIS_PROMPT } from './feedback';

export {
  INTERVIEWER_PERSONA,
  INTERVIEWER_CLOSING,
  BEHAVIORAL_PROMPT,
  TECHNICAL_PROMPT,
  SYSTEM_DESIGN_PROMPT,
  FRONTEND_PROMPT,
  BACKEND_PROMPT,
  FULLSTACK_PROMPT,
  DEVOPS_PROMPT,
  FEEDBACK_ANALYSIS_PROMPT,
};

import type { InterviewConfig } from '../engine';

/** Select the correct prompt for an interview configuration. */
export function selectPrompt(config: Pick<InterviewConfig, 'type' | 'targetRole'>): string {
  // Match by role first, then type
  const role = config.targetRole.toLowerCase();

  if (role.includes('frontend') || role.includes('react') || role.includes('ui')) {
    return FRONTEND_PROMPT;
  }
  if (role.includes('backend') || role.includes('api') || role.includes('server')) {
    return BACKEND_PROMPT;
  }
  if (role.includes('fullstack') || role.includes('full-stack') || role.includes('full stack')) {
    return FULLSTACK_PROMPT;
  }
  if (role.includes('devops') || role.includes('sre') || role.includes('platform') || role.includes('infrastructure')) {
    return DEVOPS_PROMPT;
  }
  if (role.includes('system') && (role.includes('design') || role.includes('architect'))) {
    return SYSTEM_DESIGN_PROMPT;
  }

  // Fall back to interview type
  switch (config.type) {
    case 'behavioral': return BEHAVIORAL_PROMPT;
    case 'technical': return TECHNICAL_PROMPT;
    case 'mixed': return `${BEHAVIORAL_PROMPT}\n\n---\n\n${TECHNICAL_PROMPT}`;
    default: return BEHAVIORAL_PROMPT;
  }
}

export const PROMPT_VERSIONS: Record<string, string> = {
  'interviewer-persona': '2.0.0',
  'behavioral': '2.0.0',
  'technical': '2.0.0',
  'system-design': '2.0.0',
  'frontend': '2.0.0',
  'backend': '2.0.0',
  'fullstack': '2.0.0',
  'devops': '2.0.0',
  'feedback': '2.0.0',
};
