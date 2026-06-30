'use client';

import { AlertTriangle, Wifi, WifiOff, Shield, Clock, Server, Mic, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ErrorCategory } from '@/lib/api/error-handler';

interface ErrorDisplayProps {
  message: string;
  category?: ErrorCategory;
  onRetry?: () => void;
  onDismiss?: () => void;
  compact?: boolean;
}

const ICONS: Record<ErrorCategory, typeof AlertTriangle> = {
  network: WifiOff,
  auth: Shield,
  validation: AlertTriangle,
  server: Server,
  rate_limit: Clock,
  voice: Mic,
  timeout: Clock,
  unknown: AlertTriangle,
};

const COLORS: Record<ErrorCategory, string> = {
  network: 'border-amber-500/30 bg-amber-500/5',
  auth: 'border-blue-500/30 bg-blue-500/5',
  validation: 'border-amber-500/30 bg-amber-500/5',
  server: 'border-red-500/30 bg-red-500/5',
  rate_limit: 'border-amber-500/30 bg-amber-500/5',
  voice: 'border-purple-500/30 bg-purple-500/5',
  timeout: 'border-amber-500/30 bg-amber-500/5',
  unknown: 'border-red-500/30 bg-red-500/5',
};

export function ErrorDisplay({ message, category = 'unknown', onRetry, onDismiss, compact = false }: ErrorDisplayProps) {
  const Icon = ICONS[category];

  if (compact) {
    return (
      <div className={`flex items-start gap-3 rounded-xl border p-4 ${COLORS[category]}`}>
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="text-sm">{message}</p>
          {onRetry && (
            <Button variant="link" size="sm" className="mt-1 h-auto p-0 text-sm" onClick={onRetry}>
              <RefreshCw className="mr-1 h-3 w-3" /> Try again
            </Button>
          )}
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="shrink-0 text-muted-foreground hover:text-foreground">×</button>
        )}
      </div>
    );
  }

  return (
    <Card className={`flex flex-col items-center p-8 text-center ${COLORS[category]}`}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-background">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">{message}</h3>
      <div className="mt-4 flex gap-3">
        {onRetry && (
          <Button variant="outline" onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        )}
        {onDismiss && (
          <Button variant="ghost" onClick={onDismiss}>Dismiss</Button>
        )}
      </div>
    </Card>
  );
}
