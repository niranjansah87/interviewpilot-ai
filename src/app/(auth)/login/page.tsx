'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Mic, Sparkles, BarChart3, Shield, Loader2 } from 'lucide-react';
import Link from 'next/link';

const highlights = [
  { icon: Mic, text: 'Real voice conversations with adaptive AI' },
  { icon: Sparkles, text: 'Resume-aware personalized interviews' },
  { icon: BarChart3, text: 'Detailed feedback with improvement roadmap' },
  { icon: Shield, text: 'Enterprise-grade security & privacy' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail ?? 'Invalid email or password.'); return; }
      window.location.href = '/dashboard';
    } catch { setError('Network error. Please check your connection.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-center bg-muted/20 px-16 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_50%,hsl(var(--primary)/0.04),transparent_60%)]" />
        <div className="relative z-10 max-w-md space-y-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Image src="/logo_dark.png" alt="" width={32} height={32} className="hidden dark:block" />
            <Image src="/logo_light.png" alt="" width={32} height={32} className="block dark:hidden" />
            <span className="text-sm font-semibold tracking-tight">InterviewPilot</span>
          </Link>

          <div>
            <h2 className="text-2xl font-bold tracking-tight">Practice interviews that actually prepare you</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              AI-powered voice interviews that adapt to your responses, challenge you with real follow-ups, and provide detailed feedback to help you improve.
            </p>
          </div>

          <div className="space-y-3">
            {highlights.map(({ icon: Icon, text }) => (
              <motion.div key={text} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                {text}
              </motion.div>
            ))}
          </div>

          <blockquote className="border-l-2 border-primary/30 pl-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              &ldquo;The most realistic interview practice I&apos;ve experienced. The AI asks follow-up questions just like a real interviewer.&rdquo;
            </p>
            <footer className="mt-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Alex Rivera</span> — Senior SWE at Stripe
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right — Form panel */}
      <div className="flex w-full items-center justify-center px-8 lg:w-1/2">
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="mb-10 lg:hidden">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/logo_dark.png" alt="" width={28} height={28} className="hidden dark:block" />
              <Image src="/logo_light.png" alt="" width={28} height={28} className="block dark:hidden" />
              <span className="font-semibold text-sm">InterviewPilot</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to continue your interview practice.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
              <input
                id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required
                className="w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm transition-colors placeholder:text-muted-foreground/50 hover:border-border focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <a href="#" className="text-xs text-muted-foreground hover:text-foreground">Forgot?</a>
              </div>
              <div className="relative">
                <input
                  id="password" type={showPw ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)} required
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 pr-10 text-sm transition-colors placeholder:text-muted-foreground/50 hover:border-border focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">{error}</motion.p>
              )}
            </AnimatePresence>

            <button type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
