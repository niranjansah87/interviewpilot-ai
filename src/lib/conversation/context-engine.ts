/**
 * Context Engine — assembles the complete interview context for the AI.
 * Merges candidate profile, resume, job description, and conversation history
 * into a structured context that the AI receives before speaking.
 */

import type { InterviewConfig } from './engine';

// ---- Data Structures ----

export interface CandidateProfile {
  fullName: string;
  currentRole?: string;
  yearsOfExperience?: number;
  skills: string[];
  technologies: string[];
  currentCompany?: string;
}

export interface ResumeData {
  projects: Array<{ name: string; description: string; technologies: string[] }>;
  experience: Array<{ role: string; company: string; duration: string; highlights: string[] }>;
  education: Array<{ degree: string; institution: string; year: string }>;
  achievements: string[];
}

export interface JobDescription {
  title: string;
  requiredSkills: string[];
  responsibilities: string[];
  seniority: string;
  keywords: string[];
  rawText?: string;
}

export interface InterviewContext {
  candidate: CandidateProfile;
  resume: ResumeData | null;
  jobDescription: JobDescription | null;
  config: InterviewConfig;
  previousInterviews: PreviousInterviewSummary[];
}

export interface PreviousInterviewSummary {
  type: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  date: string;
}

// ---- Context Builder ----

export function buildInterviewContext(params: {
  candidate: CandidateProfile;
  resume?: ResumeData | null;
  jobDescription?: JobDescription | null;
  config: InterviewConfig;
  previousInterviews?: PreviousInterviewSummary[];
}): InterviewContext {
  return {
    candidate: params.candidate,
    resume: params.resume ?? null,
    jobDescription: params.jobDescription ?? null,
    config: params.config,
    previousInterviews: params.previousInterviews ?? [],
  };
}

// ---- Personalized Introduction Generator ----

export function generateIntroduction(ctx: InterviewContext): string {
  const { candidate, resume, jobDescription, config } = ctx;
  const name = candidate.fullName || 'Candidate';
  const firstName = name.split(' ')[0] ?? name;

  const parts: string[] = [];

  // Greeting
  parts.push(`Hi ${firstName}, I'm your AI interviewer today.`);

  // Resume mention
  if (resume && (resume.projects.length > 0 || resume.experience.length > 0)) {
    const tech = new Set<string>();
    resume.projects.forEach((p) => p.technologies.forEach((t) => tech.add(t)));
    resume.experience.forEach((e) => e.highlights.forEach((h) => {
      // Extract tech mentions from highlights
      ['React', 'Next.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Docker', 'AWS', 'Kubernetes', 'Python', 'Go', 'Rust', 'GraphQL', 'REST', 'MongoDB', 'SQL'].forEach(
        (kw) => { if (h.includes(kw)) tech.add(kw); },
      );
    }));

    if (tech.size > 0) {
      const techList = [...tech].slice(0, 8).join(', ');
      parts.push(`I've reviewed your resume and noticed your experience with ${techList}.`);
    }
  }

  // Interview description
  const typeLabel = config.type === 'behavioral' ? 'behavioral' :
    config.type === 'technical' ? 'technical' : 'mixed';

  parts.push(
    `Today we'll conduct a ${candidate.currentRole ? candidate.currentRole + ' level ' : ''}${typeLabel} interview for a ${config.targetRole} position.`,
  );

  // Job description alignment
  if (jobDescription && jobDescription.requiredSkills.length > 0) {
    const skills = jobDescription.requiredSkills.slice(0, 5).join(', ');
    parts.push(`I see the role emphasizes ${skills}, so I'll focus our conversation around those areas.`);
  }

  // Interview style
  parts.push("I'll ask follow-up questions when I need more detail, and I may challenge your reasoning to understand your thinking. Take your time — treat this as a real conversation.");
  parts.push("Let's begin.");

  return parts.join(' ');
}

// ---- Resume-Aware Question Generator ----

export function generateResumeAwareQuestion(ctx: InterviewContext, topicIndex: number): string | null {
  const { resume } = ctx;
  if (!resume || topicIndex >= resume.experience.length) return null;

  const exp = resume.experience[topicIndex];
  if (!exp) return null;

  const questions = [
    `I noticed on your resume you worked as ${exp.role} at ${exp.company}. Can you tell me about the most technically challenging project there?`,
    `Your resume mentions ${exp.company} — what was the biggest lesson you took away from that experience?`,
    `At ${exp.company}, you were a ${exp.role}. What was a decision you made there that you're particularly proud of?`,
  ];

  return questions[topicIndex % questions.length] ?? questions[0] ?? null;
}

// ---- Context Compression (for token optimization) ----

export function compressContext(ctx: InterviewContext, maxTokens = 2000): string {
  const parts: string[] = [];

  parts.push(`Candidate: ${ctx.candidate.fullName}`);
  if (ctx.candidate.currentRole) parts.push(`Current Role: ${ctx.candidate.currentRole}`);
  if (ctx.candidate.technologies.length > 0) parts.push(`Tech: ${ctx.candidate.technologies.slice(0, 10).join(', ')}`);

  if (ctx.resume?.experience.length) {
    parts.push('Experience: ' + ctx.resume.experience
      .map((e) => `${e.role} at ${e.company} (${e.duration})`)
      .slice(0, 5)
      .join('; '));
  }

  if (ctx.jobDescription) {
    parts.push(`Target Role: ${ctx.jobDescription.title}`);
    parts.push(`Required Skills: ${ctx.jobDescription.requiredSkills.slice(0, 10).join(', ')}`);
  }

  return parts.join('\n').slice(0, maxTokens * 4); // ~4 chars per token
}
