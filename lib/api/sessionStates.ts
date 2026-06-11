import { randomUUID } from 'crypto';
import { IntakeSession } from '@/types/types';

export const trialSlug = 'trial';
export const maxTrialTurns = 20;

const store = new Map<string, IntakeSession>();

export async function createSession(firmSlug: string): Promise<IntakeSession> {
  const session: IntakeSession = {
    id: randomUUID(),
    firmSlug,
    status: 'active',
    turnCount: 0,
    isTrial: firmSlug === trialSlug,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toDateString()
  };
  store.set(session.id, session);
  return session;
}

export function isTrialExhausted(session: IntakeSession): boolean {
  return session.isTrial && session.turnCount >= maxTrialTurns;
}

export async function getSession(id: string): Promise<IntakeSession | null> {
  return store.get(id) ?? null;
}

export async function incrementTurn(id: string): Promise<IntakeSession | null> {
  const session = store.get(id);
  if (!session) throw new Error(`Session not found: ${id}`);
  if (isTrialExhausted(session)) return null;
  const updated = { ...session, turnCount: session.turnCount + 1 };
  store.set(id, updated);
  return updated;
}

export async function completeSession(id: string): Promise<IntakeSession | null> {
  const session = store.get(id);
  if (!session) throw new Error(`Session not found: ${id}`);
  if (session.status === 'complete') return session;
  const updated = { ...session, status: 'complete' as const, completedAt: new Date().toISOString() };
  store.set(id, updated);
  return updated;
}