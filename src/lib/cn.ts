/**
 * Merges Tailwind class names safely.
 * Built on top of clsx + tailwind-merge.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge and combine Tailwind classes.
 * Handles conflicts intelligently — later classes override earlier ones.
 *
 * @example
 * cn('px-4 py-2 bg-blue-500', 'bg-red-500')
 * // → 'px-4 py-2 bg-red-500'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
