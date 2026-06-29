import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-\1 mx-px-6 mx-py-4 mx-flex mx-items-center mx-justify-between">
          <span className="text-xl font-bold tracking-tight">InterviewPilot AI</span>
          <nav className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mx-max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            Practice interviews with an AI that{' '}
            <span className="text-primary">listens</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Realistic voice interviews powered by adaptive AI. Get personalized
            feedback after every session.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="rounded-lg bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Start Free Interview
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-border px-8 py-4 text-base font-semibold text-foreground transition-colors hover:bg-accent"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-muted/30 px-6 py-24">
        <div className="mx-max-w-5xl">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            How it works
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Choose your interview',
                desc: 'Select behavioral, technical, or mixed. Set your experience level and target role.',
              },
              {
                step: '02',
                title: 'Speak with an AI interviewer',
                desc: 'Answer natural follow-up questions. The AI adapts to your responses in real time.',
              },
              {
                step: '03',
                title: 'Get actionable feedback',
                desc: 'Receive detailed scores, strengths, and specific improvement suggestions.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="rounded-xl border border-border bg-card p-8">
                <span className="text-5xl font-bold text-muted-foreground/30">{step}</span>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} InterviewPilot AI. MIT License.</p>
      </footer>
    </main>
  );
}
