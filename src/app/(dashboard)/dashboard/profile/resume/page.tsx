'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileText, Loader2, Check, X, Sparkles, FileUp, Hash, Mail, Phone, Code } from 'lucide-react';

interface ResumeStats { words: number; hasEmail: boolean; hasPhone: boolean; skills: string[]; companies: string[]; }

function analyzeResume(text: string): ResumeStats {
  const words = text.split(/\s+/).filter(Boolean).length;
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/.test(text);
  const skills = ['React','TypeScript','JavaScript','Python','Node','Go','Rust','Java','SQL','AWS','Docker','Kubernetes','GraphQL','REST','Next.js','Prisma','Redis','PostgreSQL','MongoDB','Git','CI/CD','Linux','Agile','Tailwind'].filter(s => text.toLowerCase().includes(s.toLowerCase()));
  const companies = ['Google','Amazon','Microsoft','Meta','Apple','Stripe','Airbnb','Uber'].filter(c => text.toLowerCase().includes(c.toLowerCase()));
  return { words, hasEmail, hasPhone, skills, companies };
}

export default function ResumePage() {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [stats, setStats] = useState<ResumeStats | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch('/api/v1/users/me/resume', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data?.text) { setText(d.data.text); setFileName('Saved'); setStats(analyzeResume(d.data.text)); } })
      .finally(() => setLoading(false));
  }, []);

  const autoSave = useCallback((content: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (!content || content.length < 50) return;
    saveTimer.current = setTimeout(async () => {
      try { await fetch('/api/v1/users/me/resume', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ text: content }) }); setSaved(true); setTimeout(() => setSaved(false), 1500); } catch {}
    }, 1000);
  }, []);

  const handleTextChange = (value: string) => { setText(value); if (value.length >= 50) { setStats(analyzeResume(value)); autoSave(value); } };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setParsing(true); setFileName(file.name);
    try {
      let extracted = '';
      if (file.name.endsWith('.txt')) {
        extracted = await file.text();
      } else if (file.name.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = await import('pdfjs-dist');
        // Worker served from public/ — self-origin, no CSP violation
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdf = await loadingTask.promise;
        const pages: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const text = content.items.map((item: any) => item.str).join(' ');
          pages.push(text);
        }
        extracted = pages.join('\n');
      } else if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ arrayBuffer });
        extracted = result.value;
      }
      if (!extracted?.trim() || extracted.trim().length < 50) {
        toast.error('Could not extract enough text. Try pasting manually.');
        setParsing(false); return;
      }
      setText(extracted);
      setStats(analyzeResume(extracted));
      autoSave(extracted);
      toast.success(`Parsed — ${extracted.split(/\\s+/).filter(Boolean).length} words`);
    } catch (err) {
      console.error('Resume parse error:', err);
      toast.error('Failed to parse file. Try pasting as text.');
    }
    finally { setParsing(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="mx-auto flex max-w-3xl flex-col" style={{ height: 'calc(100vh - 7rem)' }}>
      {/* Header row */}
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Resume</h1>
          <p className="text-xs text-muted-foreground">Your resume personalizes interview questions</p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept=".txt,.pdf,.docx" onChange={handleFile} className="hidden" />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={parsing} className="gap-1 rounded-lg h-8 text-xs">
            {parsing ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileUp className="h-3 w-3" />}
            {fileName || 'Upload'}
          </Button>
          {fileName && <button onClick={() => { setFileName(''); setText(''); setStats(null); }} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>}
        </div>
      </div>

      {/* Stats bar — compact inline */}
      {stats && (
        <div className="mb-2 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-0.5 rounded-lg border border-border/30 bg-card/50 px-3 py-1.5 text-[11px]">
          <span className="flex items-center gap-1"><Hash className="h-3 w-3 text-muted-foreground" /><span className="font-medium">{stats.words}</span> words</span>
          <span className={stats.hasEmail ? 'text-emerald-600' : 'text-muted-foreground/40'}>{stats.hasEmail ? '✓' : '—'} Email</span>
          <span className={stats.hasPhone ? 'text-emerald-600' : 'text-muted-foreground/40'}>{stats.hasPhone ? '✓' : '—'} Phone</span>
          <span className="flex items-center gap-1"><Code className="h-3 w-3 text-muted-foreground" /><span className="font-medium">{stats.skills.length}</span> skills</span>
        </div>
      )}

      {/* Skills — compact */}
      {stats && stats.skills.length > 0 && (
        <div className="mb-2 flex shrink-0 flex-wrap gap-1">
          {stats.skills.slice(0, 12).map(s => <span key={s} className="rounded-full bg-primary/5 px-2 py-0.5 text-[10px] text-primary/70">{s}</span>)}
          {stats.skills.length > 12 && <span className="text-[10px] text-muted-foreground">+{stats.skills.length - 12} more</span>}
        </div>
      )}

      {/* Textarea — fills remaining space */}
      <div className="relative flex-1 min-h-0">
        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Paste your resume here, or upload PDF/DOCX/TXT. Include work experience, education, skills, and projects."
          className="h-full w-full resize-none rounded-xl border border-border/40 bg-card p-4 text-sm leading-relaxed shadow-sm placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/5"
        />
        <div className="absolute bottom-2 right-3 flex items-center gap-2 text-[11px] text-muted-foreground/50">
          {saved && <span className="text-emerald-500 flex items-center gap-0.5"><Check className="h-3 w-3" />Saved</span>}
          <span>{text.length} chars</span>
        </div>
      </div>

      {text.length > 0 && (
        <p className="mt-1.5 flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary/50" /> AI references your experience during interviews
        </p>
      )}
    </div>
  );
}
