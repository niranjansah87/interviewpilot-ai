/**
 * Agent Pool — weighted random selection with circuit breaker failover.
 * Distributes load evenly across ElevenLabs agents and handles failures gracefully.
 */

interface AgentConfig {
  id: string;
  key: string;
  label: string;
}

interface PoolEntry extends AgentConfig {
  weight: number;
  failures: number;
  lastFailure: number;
  open: boolean; // circuit breaker open = skip this agent
}

const CIRCUIT_BREAK_THRESHOLD = 3; // failures before opening circuit
const CIRCUIT_RESET_MS = 5 * 60 * 1000; // 5 minutes
const MIN_WEIGHT = 1;
const MAX_WEIGHT = 20;

const pool: PoolEntry[] = [];

function buildPool(): PoolEntry[] {
  if (pool.length > 0) return pool;

  const agents: (AgentConfig | null)[] = [
    process.env.ELEVENLABS_AGENT_ID && process.env.ELEVENLABS_API_KEY
      ? { id: process.env.ELEVENLABS_AGENT_ID, key: process.env.ELEVENLABS_API_KEY, label: 'agent-1' } : null,
    process.env.ELEVENLABS_BACKUP_AGENT_ID && process.env.ELEVENLABS_BACKUP_API_KEY
      ? { id: process.env.ELEVENLABS_BACKUP_AGENT_ID, key: process.env.ELEVENLABS_BACKUP_API_KEY, label: 'agent-2' } : null,
    process.env.ELEVENLABS_EXTRA_AGENT_ID && process.env.ELEVENLABS_EXTRA_API_KEY
      ? { id: process.env.ELEVENLABS_EXTRA_AGENT_ID, key: process.env.ELEVENLABS_EXTRA_API_KEY, label: 'agent-3' } : null,
  ];

  for (const a of agents) {
    if (a) pool.push({ ...a, weight: 10, failures: 0, lastFailure: 0, open: false });
  }
  return pool;
}

/** Reset circuit breakers that have expired */
function checkCircuits(entries: PoolEntry[]): void {
  const now = Date.now();
  for (const e of entries) {
    if (e.open && now - e.lastFailure > CIRCUIT_RESET_MS) {
      e.open = false;
      e.failures = 0;
      e.weight = 5; // Start back with low weight
    }
  }
}

/** Weighted random selection */
function weightedRandom(entries: PoolEntry[]): PoolEntry | null {
  const available = entries.filter(e => !e.open);
  if (available.length === 0) return null;

  const totalWeight = available.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * totalWeight;

  for (const e of available) {
    r -= e.weight;
    if (r <= 0) return e;
  }
  return available[available.length - 1] ?? null;
}

/** Get next agent from pool (weighted random) */
export function selectAgent(): PoolEntry | null {
  const entries = buildPool();
  if (entries.length === 0) return null;
  checkCircuits(entries);

  // If all circuits open, force-reset and try anyway
  const available = entries.filter(e => !e.open);
  if (available.length === 0) {
    for (const e of entries) { e.open = false; e.failures = 0; }
    return weightedRandom(entries);
  }
  return weightedRandom(entries);
}

/** Report agent success — increase weight */
export function reportSuccess(agentId: string): void {
  const e = pool.find(a => a.id === agentId);
  if (e) {
    e.failures = 0;
    e.weight = Math.min(MAX_WEIGHT, e.weight + 1);
  }
}

/** Report agent failure — decrease weight, maybe open circuit */
export function reportFailure(agentId: string): void {
  const e = pool.find(a => a.id === agentId);
  if (!e) return;

  e.failures++;
  e.lastFailure = Date.now();
  e.weight = Math.max(MIN_WEIGHT, e.weight - 3);

  if (e.failures >= CIRCUIT_BREAK_THRESHOLD) {
    e.open = true;
  }
}

/** Get pool stats for debugging */
export function getPoolStats() {
  return pool.map(e => ({
    label: e.label,
    weight: e.weight,
    failures: e.failures,
    open: e.open,
  }));
}
