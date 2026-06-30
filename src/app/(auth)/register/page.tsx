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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPw) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ email, password, name: name || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail ?? 'Registration failed.'); return; }
      router.push('/dashboard');
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  };

  const pwStrength = password.length >= 12 ? 3 : password.length >= 8 ? 2 : password.length > 0 ? 1 : 0;
  const pwLabel = ['', 'Weak', 'Fair', 'Strong'][pwStrength];
  const pwColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500'][pwStrength];

  const inputClass = 'w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm transition-colors placeholder:text-muted-foreground/50 hover:border-border focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10';

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
            <h2 className="text-2xl font-bold tracking-tight">Start practicing in seconds</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Create your account and begin realistic AI-powered voice interviews. No credit card required.
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
              &ldquo;I landed my dream job after just 2 weeks of practicing with InterviewPilot. The feedback is incredibly detailed.&rdquo;
            </p>
            <footer className="mt-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Sarah Chen</span> — Full-Stack Developer
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right — Form panel */}
      <div className="flex w-full items-center justify-center px-8 lg:w-1/2">
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-[380px]">
          <div className="mb-10 lg:hidden">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/logo_dark.png" alt="" width={28} height={28} className="hidden dark:block" />
              <Image src="/logo_light.png" alt="" width={28} height={28} className="block dark:hidden" />
              <span className="font-semibold text-sm">InterviewPilot</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Free forever. No credit card required.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                Full name <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera" className={inputClass} />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required className={inputClass} />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</label>
              <div className="relative">
                <input id="password" type={showPw ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)} required minLength={8}
                  placeholder="Min. 8 characters" className={`${inputClass} pr-10`} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3].map((l) => <div key={l} className={`h-1 flex-1 rounded-full ${pwStrength >= l ? pwColor : 'bg-muted'}`} />)}
                  </div>
                  <span className="text-xs text-muted-foreground">{pwLabel}</span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium">Confirm password</label>
              <input id="confirm" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                required placeholder="Re-enter your password" className={inputClass} />
            </div>

            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">{error}</motion.p>
              )}
            </AnimatePresence>

            <button type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</> : <>Create account <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
