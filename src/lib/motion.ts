/**
 * Reusable Framer Motion presets — use across the entire application.
 * Never duplicate animation definitions in components.
 */
import type { Variants, Transition } from 'framer-motion';

// ── Transitions ──────────────────────────────────────────────

export const spring: Transition = { type: 'spring', stiffness: 400, damping: 30 };
export const springGentle: Transition = { type: 'spring', stiffness: 200, damping: 25 };
export const tween: Transition = { duration: 0.2, ease: [0.4, 0, 0.2, 1] };
export const tweenSlow: Transition = { duration: 0.4, ease: [0.4, 0, 0.2, 1] };

// ── Page / Section ───────────────────────────────────────────

export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: tweenSlow },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: springGentle },
};

export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

// ── Cards & Containers ───────────────────────────────────────

export const cardEnter: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: springGentle },
};

// ── Conversation / Transcript ─────────────────────────────────

export const bubbleIn: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: spring },
};

export const bubbleLeft: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: spring },
};

export const bubbleRight: Variants = {
  hidden: { opacity: 0, x: 12 },
  visible: { opacity: 1, x: 0, transition: spring },
};

// ── Dialog / Overlay ─────────────────────────────────────────

export const overlayIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: tween },
};

export const dialogIn: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: springGentle },
};

// ── Micro Interactions ───────────────────────────────────────

export const hoverLift = {
  whileHover: { scale: 1.02, transition: spring },
  whileTap: { scale: 0.98 },
};

export const pressScale = {
  whileTap: { scale: 0.96, transition: { duration: 0.1 } },
};

// ── Loading / Pulse ──────────────────────────────────────────

export const pulse: Variants = {
  animate: {
    opacity: [0.3, 1, 0.3],
    transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
  },
};

export const shimmer = 'animate-pulse bg-muted rounded';

// ── Page Transitions ─────────────────────────────────────────

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: tweenSlow },
  exit: { opacity: 0, y: -8, transition: tween },
};
