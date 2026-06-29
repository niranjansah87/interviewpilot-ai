'use client';

import { Toaster as Sonner } from 'sonner';
import { useTheme } from 'next-themes';

export function Toaster() {
  const { theme } = useTheme();

  return (
    <Sonner
      className="toaster group"
      theme={theme === 'system' ? 'system' : (theme as 'light' | 'dark')}
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full',
          description: 'text-sm text-muted-foreground',
          actionButton:
            'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
          cancelButton:
            'bg-muted text-muted-foreground hover:bg-muted/80',
          success: 'border-transparent bg-primary text-primary-foreground',
          error: 'border-transparent bg-destructive text-destructive-foreground',
        },
      }}
    />
  );
}
