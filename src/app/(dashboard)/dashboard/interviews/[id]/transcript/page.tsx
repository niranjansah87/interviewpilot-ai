'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface TranscriptEntry {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

export default function TranscriptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/interviews/${id}/transcript`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setEntries(d.data?.entries ?? []))
      .catch(() => toast.error('Failed to load transcript'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2 gap-1 text-muted-foreground">
          <Link href={`/dashboard/interviews/${id}`}><ArrowLeft className="h-4 w-4" /> Back to Interview</Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Transcript</h1>
        <p className="text-sm text-muted-foreground">{entries.length} conversation turns</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-20 text-center">
          <p className="text-sm text-muted-foreground">No transcript available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className={`flex ${entry.role === 'CANDIDATE' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                entry.role === 'CANDIDATE'
                  ? 'rounded-tr-md bg-primary text-primary-foreground'
                  : 'rounded-tl-md bg-muted'
              }`}>
                <p className="text-[10px] font-medium uppercase tracking-wider opacity-60 mb-1">
                  {entry.role === 'INTERVIEWER' ? 'Interviewer' : 'You'}
                </p>
                <p className="text-sm leading-relaxed">{entry.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
