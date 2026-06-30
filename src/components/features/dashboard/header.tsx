'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { User, Settings, LogOut, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/v1/users/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data) setUser(d.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() ?? '?';

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
      toast.success('Signed out');
      router.push('/login');
    } catch { toast.error('Failed to sign out'); }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end gap-2 border-b border-border bg-background px-6">
      <ThemeToggle />
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary transition-opacity hover:opacity-80"
        >
          {initials}
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-lg">
            <div className="border-b border-border px-3 pb-2.5 pt-1.5">
              <p className="text-sm font-medium">{user?.name || 'User'}</p>
              <p className="text-[11px] text-muted-foreground">{user?.email || ''}</p>
            </div>
            <div className="py-1">
              <Link href="/dashboard" onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <Link href="/dashboard/profile" onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
                <User className="h-4 w-4" /> Profile
              </Link>
              <Link href="/dashboard/settings" onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
                <Settings className="h-4 w-4" /> Settings
              </Link>
            </div>
            <div className="border-t border-border pt-1">
              <button onClick={() => { setOpen(false); handleLogout(); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
