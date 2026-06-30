'use client';

import { Toaster as Sonner } from 'sonner';
import { useTheme } from 'next-themes';

export function Toaster() {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme === 'system' ? 'system' : (theme as 'light' | 'dark')}
      position="bottom-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        className:
          'rounded-xl border border-border bg-card text-foreground shadow-lg',
        descriptionClassName: 'text-muted-foreground',
      }}
    />
  );
}
