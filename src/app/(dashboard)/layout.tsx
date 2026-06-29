import { Separator } from '@/components/ui/separator';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Minimal dashboard shell — real implementation in Phase 3 */}
      <header className="border-b border-border px-6 py-4">
        <div className="mx-flex mx-max-w-5xl mx-flex mx-items-center mx-justify-between">
          <span className="font-bold">InterviewPilot</span>
        </div>
      </header>
      <main className="flex-1 px-6 py-8">
        <div className="mx-max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
