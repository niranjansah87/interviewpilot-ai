import { cn } from '@/lib/cn';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-lg bg-muted/60', className)} {...props} />;
}

/** Card-shaped skeleton for loading states */
export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border p-6 space-y-4">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

/** Table row skeleton */
export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border p-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-16 rounded-lg" />
    </div>
  );
}
