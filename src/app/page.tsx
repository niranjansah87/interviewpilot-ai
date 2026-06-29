import Link from 'next/link';
import { Hero } from '@/components/features/landing/hero';
import { ArrowRight, Mic, BarChart3, Zap, Shield, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FEATURES = [
  { icon: Mic, title: 'Voice Interviews', desc: 'Natural conversation with an AI that asks real follow-up questions' },
  { icon: Zap, title: 'Adaptive Difficulty', desc: 'The AI adjusts based on your responses and experience level' },
  { icon: BarChart3, title: 'Detailed Feedback', desc: 'Get scored on communication, confidence, and technical depth' },
  { icon: Shield, title: 'Private & Secure', desc: 'Your interviews are encrypted and only visible to you' },
  { icon: MessageSquare, title: 'Transcripts', desc: 'Review every word. Learn from your exact responses' },
];

const STEPS = [
  { step: '1', title: 'Choose your interview', desc: 'Select behavioral, technical, or mixed. Set your role and level.' },
  { step: '2', title: 'Speak naturally', desc: 'Answer questions just like a real interview. The AI follows up.' },
  { step: '3', title: 'Get actionable insights', desc: 'Receive a detailed report with strengths and specific improvements.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight">InterviewPilot AI</span>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Sign in
            </Link>
            <Button asChild size="sm">
              <Link href="/register">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <Hero />

      {/* Features */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Why InterviewPilot?</h2>
          <p className="mt-4 text-muted-foreground">
            Everything you need to prepare for real interviews
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group rounded-xl border border-border bg-card p-6 text-left transition-shadow hover:shadow-md">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border bg-muted/30 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold tracking-tight">How it works</h2>
          <div className="mt-12 grid gap-12 sm:grid-cols-3">
            {STEPS.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {step}
                </div>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Ready to ace your next interview?</h2>
          <p className="mt-4 text-muted-foreground">
            Start practicing with an AI interviewer that adapts, challenges, and helps you improve.
          </p>
          <Button asChild size="lg" className="mt-8 gap-2">
            <Link href="/register">
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} InterviewPilot AI</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
