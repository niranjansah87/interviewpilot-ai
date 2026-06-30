import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { ComponentProps } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href: string } | { label: string; onClick: () => void };
  variant?: 'default' | 'compact';
}

export function EmptyState({ icon: Icon, title, description, action, variant = 'default' }: EmptyStateProps) {
  const isCompact = variant === 'compact';
  const actionButton = action && (
    'href' in action ? (
      <Button asChild size={isCompact ? 'sm' : 'default'}>
        <Link href={action.href}>{action.label}</Link>
      </Button>
    ) : (
      <Button onClick={action.onClick} size={isCompact ? 'sm' : 'default'}>
        {action.label}
      </Button>
    )
  );

  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center ${
      isCompact ? 'py-10 px-4' : 'py-16 px-6'
    }`}>
      <div className={`flex items-center justify-center rounded-full bg-muted/50 ${
        isCompact ? 'mb-4 h-14 w-14' : 'mb-6 h-20 w-20'
      }`}>
        <Icon className={isCompact ? 'h-6 w-6 text-muted-foreground/40' : 'h-8 w-8 text-muted-foreground/30'} />
      </div>
      <h3 className={isCompact ? 'text-base font-semibold' : 'text-lg font-semibold'}>{title}</h3>
      <p className={`mt-1 max-w-sm text-muted-foreground ${isCompact ? 'text-sm' : 'text-sm'}`}>{description}</p>
      {actionButton && <div className="mt-5">{actionButton}</div>}
    </div>
  );
}
