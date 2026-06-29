'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end border-b border-border bg-background px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="rounded-xl transition-all duration-200 hover:bg-accent"
        aria-label="Toggle theme"
      >
        {mounted ? (
          theme === 'dark' ? (
            <Sun className="h-[18px] w-[18px] transition-transform duration-300 hover:rotate-90" />
          ) : (
            <Moon className="h-[18px] w-[18px] transition-transform duration-300 hover:rotate-12" />
          )
        ) : (
          <span className="h-[18px] w-[18px]" />
        )}
      </Button>
    </header>
  );
}
