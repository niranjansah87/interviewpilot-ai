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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, name: name || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail ?? 'Registration failed.'); return; }
      router.push('/dashboard');
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-muted/30 p-12 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(var(--primary)/0.08),transparent_60%)]" />
        <Link href="/" className="relative z-10 flex items-center gap-2">
          <Image src="/logo_dark.png" alt="" width={36} height={36} className="hidden dark:block" />
          <Image src="/logo_light.png" alt="" width={36} height={36} className="block dark:hidden" />
          <span className="text-lg font-bold tracking-tight">InterviewPilot AI</span>
        </Link>
        <div className="relative z-10">
          <blockquote className="space-y-4">
            <p className="text-xl font-medium leading-relaxed">
              &ldquo;This platform helped me land my dream role at a FAANG company. The AI feedback was incredibly detailed and actionable.&rdquo;
            </p>
            <footer className="text-sm text-muted-foreground">
              <strong className="text-foreground">Sarah Chen</strong> — Senior SWE at Google
            </footer>
          </blockquote>
        </div>
        <div className="relative z-10 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Mic className="h-3.5 w-3.5" /> Voice interviews</span>
          <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> AI feedback</span>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-12">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-sm">
          <div className="mb-8 lg:hidden flex items-center gap-2">
            <Image src="/logo_dark.png" alt="" width={28} height={28} className="hidden dark:block" />
            <Image src="/logo_light.png" alt="" width={28} height={28} className="block dark:hidden" />
            <span className="font-semibold">InterviewPilot</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Start practicing interviews in under a minute.</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-2"><Label htmlFor="name">Full name</Label><Input id="name" type="text" placeholder="Jane Doe" value={name} onChange={e => setName(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} /></div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link></p>
        </motion.div>
      </div>
    </div>
  );
}
