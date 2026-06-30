'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import { LayoutDashboard, Mic, History, Settings, User, LogOut, PanelLeftClose, PanelLeft, FileText } from 'lucide-react';
import { useState, useCallback } from 'react';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/interviews/new', label: 'New Interview', icon: Mic },
  { href: '/dashboard/interviews', label: 'History', icon: History },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/profile/resume', label: 'Resume', icon: FileText },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
      router.push('/login');
    } catch {
      // silently fail
    } finally {
      setLoggingOut(false);
    }
  }, [router]);

  return (
    <aside
      className={cn(
        'flex h-screen shrink-0 flex-col border-r border-border bg-card transition-all duration-200',
        collapsed ? 'w-[68px]' : 'w-[240px]',
      )}
    >
      {/* Logo + collapse */}
      <div className="flex h-14 items-center justify-center">
        <Link href="/dashboard" className="group">
          <Image src="/logo_dark.png" alt="InterviewPilot" width={60} height={60} className="hidden shrink-0 dark:block transition-transform duration-300 group-hover:scale-110" />
          <Image src="/logo_light.png" alt="InterviewPilot" width={60} height={60} className="block shrink-0 dark:hidden transition-transform duration-300 group-hover:scale-110" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                collapsed && 'justify-center px-0 py-2.5',
                active
                  ? 'bg-accent text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-border px-2 py-2 space-y-0.5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground',
            collapsed && 'justify-center px-0',
          )}
        >
          {collapsed ? <PanelLeft className="h-[18px] w-[18px] shrink-0" /> : <PanelLeftClose className="h-[18px] w-[18px] shrink-0" />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground',
            collapsed && 'justify-center px-0',
          )}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>{loggingOut ? 'Signing out...' : 'Sign out'}</span>}
        </button>
      </div>
    </aside>
  );
}
