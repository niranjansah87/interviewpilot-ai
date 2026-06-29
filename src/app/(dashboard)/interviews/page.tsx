import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Mic, Plus } from 'lucide-react';

export default function InterviewsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interviews</h1>
          <p className="mt-2 text-muted-foreground">Your practice history</p>
        </div>
        <Button asChild>
          <Link href="/interviews/new" className="gap-2">
            <Plus className="h-4 w-4" /> New Interview
          </Link>
        </Button>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Mic className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <CardTitle className="mb-2">No interviews yet</CardTitle>
          <CardDescription className="mb-6">
            Start your first practice interview and track your progress here.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
