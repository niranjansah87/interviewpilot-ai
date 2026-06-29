/**
 * Production Prompt Library — version-tracked, composable interview prompts.
 * Each prompt is a named, versioned module for future A/B testing.
 */

export { INTERVIEWER_PERSONA, INTERVIEWER_CLOSING } from './interviewer-persona';
export { BEHAVIORAL_PROMPT } from './behavioral';
export { TECHNICAL_PROMPT } from './technical';
export { SYSTEM_DESIGN_PROMPT } from './system-design';
export { FRONTEND_PROMPT } from './frontend';
export { BACKEND_PROMPT } from './backend';
export { FULLSTACK_PROMPT } from './fullstack';
export { DEVOPS_PROMPT } from './devops';
export { FEEDBACK_ANALYSIS_PROMPT } from './feedback';

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
