'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-2 text-muted-foreground">Customize your experience</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how InterviewPilot looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Theme</Label>
              <p className="text-sm text-muted-foreground">
                {theme === 'dark' ? 'Dark mode' : theme === 'light' ? 'Light mode' : 'Follow system'}
              </p>
            </div>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interview Preferences</CardTitle>
          <CardDescription>Default settings for new interviews</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Default Interview Type</Label>
              <p className="text-sm text-muted-foreground">Starting interview type</p>
            </div>
            <select className="rounded-md border border-border bg-background px-3 py-1.5 text-sm">
              <option>Behavioral</option>
              <option>Technical</option>
              <option>Mixed</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Default Level</Label>
              <p className="text-sm text-muted-foreground">Starting experience level</p>
            </div>
            <select className="rounded-md border border-border bg-background px-3 py-1.5 text-sm">
              <option>Junior</option>
              <option>Mid-Level</option>
              <option>Senior</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage how you receive updates</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Notification preferences coming soon.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <button
            className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90"
            onClick={() => {
              if (confirm('Are you sure you want to delete your account?')) {
                // TODO: Account deletion
              }
            }}
          >
            Delete account
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
