'use client';

import { ThemeToggle } from '@/components/ui/theme-toggle';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end border-b border-border bg-background px-6">
      <ThemeToggle />
    </header>
  );
}
