'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging — production would use Sentry
    if (process.env.NODE_ENV === 'production') {
      // In production, log structured
      console.error(JSON.stringify({
        msg: 'Unhandled client error',
        error: error.message,
        digest: error.digest,
        stack: error.stack?.split('\n').slice(0, 3).join(' | '),
      }));
    }
  }, [error]);

  return (
    <html>
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <div>
            <p className="text-8xl font-bold text-destructive/20">500</p>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">
              Something went wrong
            </h1>
            <p className="mt-2 text-muted-foreground">
              We encountered an unexpected error. Your progress has been saved.
            </p>
            <div className="mt-6 flex gap-4 justify-center">
              <Button onClick={reset}>Try again</Button>
              <Button variant="outline" asChild>
                <Link href="/">Go home</Link>
              </Button>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
