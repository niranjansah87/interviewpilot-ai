'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Mic, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      router.push('/dashboard');
    } catch { setError('Network error. Please check your connection.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — Brand Illustration */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-muted/30 p-12 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(var(--primary)/0.08),transparent_60%)]" />
        <Link href="/" className="relative z-10 flex items-center gap-2">
          <Image src="/logo_dark.png" alt="" width={70} height={70} className="hidden dark:block transition-transform duration-300 hover:scale-110" />
          <Image src="/logo_light.png" alt="" width={70} height={70} className="block dark:hidden transition-transform duration-300 hover:scale-110" />
        </Link>

        <div className="relative z-10">
          <blockquote className="space-y-4">
            <p className="text-xl font-medium leading-relaxed">
              &ldquo;The most realistic interview practice I&apos;ve ever experienced. The AI asks follow-up questions just like a real interviewer would.&rdquo;
            </p>
            <footer className="text-sm text-muted-foreground">
              <strong className="text-foreground">Alex Rivera</strong> — Senior SWE at Stripe
            </footer>
          </blockquote>
        </div>

        <div className="relative z-10 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Mic className="h-3.5 w-3.5" /> Voice interviews</span>
          <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> AI feedback</span>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo_dark.png" alt="" width={40} height={40} className="hidden dark:block transition-transform duration-300 hover:scale-110" />
              <Image src="/logo_light.png" alt="" width={40} height={40} className="block dark:hidden transition-transform duration-300 hover:scale-110" />
            </Link>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to continue your interview practice.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
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
