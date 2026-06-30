'use client';

import { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

interface UseDialogReturn {
  open: boolean;
  show: () => void;
  hide: () => void;
  DialogComponent: React.FC<{
    title: string;
    description?: string;
    children: React.ReactNode;
  }>;
}

export function useDialog(): UseDialogReturn {
  const [open, setOpen] = useState(false);
  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => setOpen(false), []);

  const DialogComponent = useCallback(
    ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => {
      if (!open) return null;
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={hide}
          />
          {/* Dialog */}
          <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">{title}</h2>
                {description && (
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                )}
              </div>
              <button
                onClick={hide}
                className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6">{children}</div>
          </div>
        </div>
      );
    },
    [open, hide],
  );

  return { open, show, hide, DialogComponent };
}
