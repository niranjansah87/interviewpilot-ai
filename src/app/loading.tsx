export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 animate-pulse-ring rounded-full bg-primary" />
        <span className="text-muted-foreground">Loading...</span>
      </div>
    </main>
  );
}
