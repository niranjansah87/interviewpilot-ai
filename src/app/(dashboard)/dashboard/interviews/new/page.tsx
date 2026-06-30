'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft, Mic, FileText, Sparkles, Calendar, Loader2, Check, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const TYPES = [
  { value: 'BEHAVIORAL', label: 'Behavioral', desc: 'Past experiences, soft skills, leadership. Focus on how you handled real situations.', icon: Mic },
  { value: 'TECHNICAL', label: 'Technical', desc: 'Problem-solving, system design, trade-offs. Depth of knowledge and reasoning.', icon: FileText },
  { value: 'MIXED', label: 'Mixed', desc: 'Start with behavioral questions then transition to technical topics.', icon: Sparkles },
];

const LEVELS = [
  { value: 'JUNIOR', label: 'Junior', desc: 'Fundamentals, learning ability, growth potential' },
  { value: 'MID', label: 'Mid-Level', desc: 'Experience, ownership, cross-team collaboration' },
  { value: 'SENIOR', label: 'Senior', desc: 'Architecture, leadership, organizational impact' },
];

const STEPS = [
  { title: 'Interview Type', subtitle: 'What kind of interview?' },
  { title: 'Target Role', subtitle: 'What position?' },
  { title: 'Experience', subtitle: 'Your level?' },
  { title: 'Schedule', subtitle: 'When to start?' },
];

export default function NewInterviewPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [type, setType] = useState('BEHAVIORAL');
  const [targetRole, setTargetRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('MID');
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setType(localStorage.getItem('pref_type') || 'BEHAVIORAL');
    setExperienceLevel(localStorage.getItem('pref_level') || 'MID');
  }, []);

  const canProceed = step === 0 ? true : step === 1 ? targetRole.trim().length > 0 : true;

  async function handleSubmit() {
    setLoading(true);
    try {
      const body: Record<string, unknown> = { type, targetRole, experienceLevel };
      if (scheduledAt) body.scheduledAt = scheduledAt;
      const res = await fetch('/api/v1/interviews', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).detail ?? 'Failed');
      const { data } = await res.json();
      toast.success(scheduledAt ? 'Interview scheduled!' : 'Interview created!');
      router.push(`/dashboard/interviews/${data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)]">
      {/* Left — Progress + Illustration */}
      <div className="hidden w-[380px] flex-col justify-center rounded-2xl bg-muted/20 px-10 py-10 lg:flex">
        <div>
          <div className="mb-10">
            <Image src="/illustrations/interview-hero.svg" alt="" width={280} height={210} className="dark:opacity-90" priority />
          </div>
          <div className="space-y-1">
            {STEPS.map((s, i) => (
              <div key={s.title} className="flex items-center gap-3 py-2">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-all ${
                  i < step ? 'bg-emerald-500/20 text-emerald-500' :
                  i === step ? 'bg-primary text-primary-foreground' :
                  'bg-muted text-muted-foreground'}`}>
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <div>
                  <div className={`text-sm font-medium ${i <= step ? 'text-foreground' : 'text-muted-foreground'}`}>{s.title}</div>
                  <div className="text-xs text-muted-foreground">{s.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-primary/5 p-4">
          <p className="text-xs text-muted-foreground">
            {step === 0 ? 'Choose the interview style that matches your preparation goals.' :
             step === 1 ? 'The AI will customize questions for this specific role.' :
             step === 2 ? 'Difficulty and expectations scale with your experience level.' :
             'Start immediately or pick a time that works for you.'}
          </p>
        </div>
      </div>

      {/* Right — Step Content */}
      <div className="flex flex-1 flex-col justify-center px-4 lg:px-12">
        {/* Mobile progress */}
        <div className="mb-6 flex items-center gap-3 lg:hidden">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }} className="w-full max-w-lg">

            {/* Step 1: Type */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Choose interview type</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Select the format that matches your preparation goals</p>
                </div>
                {TYPES.map(({ value, label, desc, icon: Icon }) => (
                  <button key={value} type="button" onClick={() => setType(value)}
                    className={`flex w-full items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all ${
                      type === value ? 'border-primary bg-primary/[0.04] shadow-sm' : 'border-border/40 hover:border-border/60 hover:bg-muted/20'}`}>
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      type === value ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{label}</div>
                      <div className="mt-0.5 text-sm text-muted-foreground">{desc}</div>
                    </div>
                    {type === value && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-4 w-4 text-primary" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Role */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">What role are you targeting?</h2>
                  <p className="mt-1 text-sm text-muted-foreground">The AI interviewer will tailor every question to this specific position</p>
                </div>
                <Input value={targetRole} onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer, Product Manager, Data Scientist"
                  className="rounded-xl h-14 text-base" autoFocus />
                <div className="flex flex-wrap gap-2">
                  {['Frontend Engineer', 'Backend Engineer', 'Full Stack', 'Product Manager', 'Engineering Manager'].map(r => (
                    <button key={r} type="button" onClick={() => setTargetRole(r)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition-all ${
                        targetRole === r ? 'border-primary bg-primary/10 text-primary' : 'border-border/40 text-muted-foreground hover:border-border'
                      }`}>{r}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Level */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Your experience level</h2>
                  <p className="mt-1 text-sm text-muted-foreground">This determines question difficulty and evaluation criteria</p>
                </div>
                {LEVELS.map(({ value, label, desc }) => (
                  <button key={value} type="button" onClick={() => setExperienceLevel(value)}
                    className={`flex w-full items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all ${
                      experienceLevel === value ? 'border-primary bg-primary/[0.04] shadow-sm' : 'border-border/40 hover:border-border/60 hover:bg-muted/20'}`}>
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-bold transition-colors ${
                      experienceLevel === value ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {value === 'JUNIOR' ? 'Jr' : value === 'MID' ? 'Md' : 'Sr'}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{label}</div>
                      <div className="mt-0.5 text-sm text-muted-foreground">{desc}</div>
                    </div>
                    {experienceLevel === value && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-4 w-4 text-primary" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Step 4: Schedule */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Start now or schedule</h2>
                  <p className="mt-1 text-sm text-muted-foreground">You can begin immediately or pick a later time</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setScheduledAt('')}
                    className={`rounded-2xl border-2 p-6 text-center transition-all ${
                      !scheduledAt ? 'border-primary bg-primary/[0.04] shadow-sm' : 'border-border/40 hover:border-border/60'}`}>
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                      <Mic className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div className="font-semibold">Start now</div>
                    <div className="text-xs text-muted-foreground">Begin immediately</div>
                  </button>
                  <button type="button" onClick={() => setScheduledAt(new Date(Date.now() + 3600000).toISOString().slice(0, 16))}
                    className={`rounded-2xl border-2 p-6 text-center transition-all ${
                      scheduledAt ? 'border-primary bg-primary/[0.04] shadow-sm' : 'border-border/40 hover:border-border/60'}`}>
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                      <Calendar className="h-6 w-6 text-amber-500" />
                    </div>
                    <div className="font-semibold">Schedule</div>
                    <div className="text-xs text-muted-foreground">Pick a date & time</div>
                  </button>
                </div>
                {scheduledAt && (
                  <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/20 p-4">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="flex-1 rounded-lg border border-border/40 bg-background px-3 py-2 text-sm" />
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex max-w-lg items-center justify-between">
          <Button variant="ghost" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            className="gap-1.5 rounded-xl"><ArrowLeft className="h-4 w-4" /> Back</Button>

          {step < 3 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed} className="gap-1.5 rounded-xl">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading} className="gap-1.5 rounded-xl">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : <>{scheduledAt ? 'Schedule Interview' : 'Start Interview'} <Check className="h-4 w-4" /></>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
