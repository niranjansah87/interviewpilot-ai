/**
 * Next.js instrumentation — runs once on server startup.
 * Verifies all infrastructure services are reachable.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { runStartupHealthCheck } = await import('./lib/startup-health');
    await runStartupHealthCheck();
  }
}
