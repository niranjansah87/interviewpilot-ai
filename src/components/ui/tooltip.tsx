'use client';

import { cn } from '@/lib/cn';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function Tooltip({ children, content, className }: TooltipProps) {
  return (
    <div className="group relative inline-flex">
      {children}
      <div
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
          'rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground',
          'opacity-0 transition-opacity group-hover:opacity-100',
          'z-50 whitespace-nowrap',
          className,
        )}
      >
        {content}
      </div>
    </div>
  );
}

export { Tooltip as TooltipTrigger };
export { Tooltip as TooltipContent };
export { Tooltip as TooltipProvider };
