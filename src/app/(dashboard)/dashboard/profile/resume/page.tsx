'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileText, Loader2, Upload, Check, FileUp, X, Sparkles } from 'lucide-react';

interface ResumeStats {
  words: number;
  lines: number;
  hasEmail: boolean;
  hasPhone: boolean;
  skills: string[];
  companies: string[];
}

function analyzeResume(text: string): ResumeStats {
  const words = text.split(/\s+/).filter(Boolean).length;
  const lines = text.split('\n').filter(Boolean).length;
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/.test(text);

  const skillPatterns = [
    'React', 'TypeScript', 'JavaScript', 'Python', 'Node', 'Go', 'Rust', 'Java', 'SQL',
    'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'REST', 'Next', 'Prisma', 'Redis',
    'PostgreSQL', 'MongoDB', 'Git', 'CI/CD', 'Linux', 'Agile', 'Scrum',
  ];
  const skills = skillPatterns.filter(s => text.toLowerCase().includes(s.toLowerCase()));

  const companyPatterns = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Stripe', 'Airbnb', 'Uber', 'Netflix', 'Spotify'];
  const companies = companyPatterns.filter(c => text.toLowerCase().includes(c.toLowerCase()));

  return { words, lines, hasEmail, hasPhone, skills, companies };
}

export default function ResumePage() {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [stats, setStats] = useState<ResumeStats | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load existing resume
  useEffect(() => {
    fetch('/api/v1/users/me/resume', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.data?.text) {
          setText(d.data.text);
          setFileName('Previously saved');
          setStats(analyzeResume(d.data.text));
        }
      }).finally(() => setLoading(false));
  }, []);

  // Auto-save with debounce
  const autoSave = useCallback((content: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (!content || content.length < 50) return;
    saveTimer.current = setTimeout(async () => {
      try {
        await fetch('/api/v1/users/me/resume', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({ text: content }),
        });
        setSaved(true); setTimeout(() => setSaved(false), 1500);
      } catch { /* silent */ }
    }, 800);
  }, []);

  const handleTextChange = (value: string) => {
    setText(value);
    if (value.length >= 50) {
      setStats(analyzeResume(value));
      autoSave(value);
    }
  };

  // File upload handler
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setFileName(file.name);

    try {
      let extracted = '';

      if (file.name.endsWith('.txt')) {
        extracted = await file.text();
      } else if (file.name.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const pdfModule = await import('pdf-parse') as any;
        const data = await pdfModule.default?.(buffer) ?? await pdfModule.PDFParse?.(buffer);
        extracted = data.text;
      } else if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ arrayBuffer });
        extracted = result.value;
      } else {
        toast.error('Unsupported file type. Use PDF, DOCX, or TXT.');
        setParsing(false);
        return;
      }

      if (extracted.trim().length < 50) {
        toast.error('Could not extract enough text. Try pasting manually.');
        setParsing(false);
        return;
      }

      setText(extracted);
      setStats(analyzeResume(extracted));
      autoSave(extracted);
      toast.success(`Parsed ${file.name} — ${extracted.split(/\s+/).filter(Boolean).length} words`);
    } catch {
      toast.error('Failed to parse file. Try pasting as text.');
    } finally {
      setParsing(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resume</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload your resume or paste it below. The AI will use it to personalize your interview.
          </p>
        </div>
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" onChange={handleFile} className="hidden" />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={parsing} className="gap-1.5 rounded-lg">
            {parsing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            Upload
          </Button>
          {fileName && (
            <span className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" /> {fileName}
              <button onClick={() => { setFileName(''); setText(''); }} className="ml-1 hover:text-foreground"><X className="h-3 w-3" /></button>
            </span>
          )}
        </div>
      </div>

      {/* Resume summary bar */}
      {stats && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-border/40 bg-card p-3 text-xs">
          <span className="text-muted-foreground">{stats.words} words</span>
          <span className="text-border">·</span>
          <span className={stats.hasEmail ? 'text-emerald-600' : 'text-muted-foreground/50'}>
            {stats.hasEmail ? '✓' : '—'} Email
          </span>
          <span className="text-border">·</span>
          <span className={stats.hasPhone ? 'text-emerald-600' : 'text-muted-foreground/50'}>
            {stats.hasPhone ? '✓' : '—'} Phone
          </span>
          <span className="text-border">·</span>
          <span className="text-muted-foreground">{stats.skills.length} skills detected</span>
          {stats.companies.length > 0 && (
            <><span className="text-border">·</span><span className="text-muted-foreground">{stats.companies.length} companies</span></>
          )}
        </div>
      )}

      {/* Skills tags */}
      {stats && stats.skills.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {stats.skills.map(s => (
            <span key={s} className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">{s}</span>
          ))}
        </div>
      )}

      {/* Text area */}
      <textarea
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder={parsing ? 'Parsing file…' : 'Paste your resume, or upload a PDF/DOCX/TXT file…'}
        className="min-h-[380px] w-full resize-y rounded-2xl border border-border/40 bg-card p-5 text-sm leading-relaxed shadow-sm placeholder:text-muted-foreground/35 focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-shadow hover:shadow-md"
      />

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{text.length} characters · Auto-save {saved ? '✓ Saved' : 'enabled'}</span>
        {stats && stats.words > 0 && (
          <span className="flex items-center gap-1 text-emerald-600">
            <Sparkles className="h-3 w-3" />
            AI context ready
          </span>
        )}
      </div>
    </div>
  );
}
