import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, History, TrendingUp, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const demoInterviews = [
  { id: '1', type: 'Behavioral', role: 'Senior SWE', date: '2 days ago', score: 82, status: 'completed' },
  { id: '2', type: 'Technical', role: 'Full-Stack Engineer', date: '5 days ago', score: 76, status: 'completed' },
  { id: '3', type: 'Behavioral', role: 'Engineering Manager', date: '1 week ago', score: 79, status: 'completed' },
];

const demoStrengths = ['Clear communication of technical concepts', 'Good use of specific examples', 'Structured STAR responses'];
const demoImprovements = ['Go deeper on trade-off analysis', 'Slow down when explaining complex topics'];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-muted-foreground">Ready for your next practice session?</p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link href="/dashboard/interviews/new">Start Interview <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Interviews', value: '12', icon: Mic, trend: '+3 this week' },
          { label: 'Avg Score', value: '79', icon: Star, trend: '+4 vs last month' },
          { label: 'Practice Streak', value: '5 days', icon: TrendingUp, trend: 'Keep it up!' },
          { label: 'Hours Practiced', value: '4.2', icon: History, trend: 'Across all sessions' },
        ].map(({ label, value, icon: Icon, trend }) => (
          <Card key={label} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Interviews + Insights */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Interviews — 2/3 width */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Interviews</CardTitle>
              <CardDescription>Your latest practice sessions</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/interviews">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demoInterviews.map((i) => (
                <div key={i.id} className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{i.type}</span>
                      <Badge variant="outline" className="text-xs">{i.role}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{i.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold">{i.score}</div>
                      <div className="text-xs text-muted-foreground">/100</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights — 1/3 width */}
        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Based on your last 3 interviews</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-emerald-500">Top Strengths</h4>
              <ul className="mt-2 space-y-1.5">
                {demoStrengths.map((s) => (
                  <li key={s} className="text-sm text-muted-foreground">• {s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-amber-500">Focus Areas</h4>
              <ul className="mt-2 space-y-1.5">
                {demoImprovements.map((s) => (
                  <li key={s} className="text-sm text-muted-foreground">• {s}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
