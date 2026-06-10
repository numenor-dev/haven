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
    isTrial: firmSlug === trialSlug
  };
  store.set(session.id, session);
  return session;
}

export async function getSession(id: string): Promise<IntakeSession | null> {
  return store.get(id) ?? null;
}

export async function incrementTurn(id: string): Promise<IntakeSession | null> {
  const session = store.get(id);
  if (!session) return null;
  session.turnCount += 1;
  return session;
}

export async function completeSession(id: string): Promise<IntakeSession | null> {
  const session = store.get(id);
  if (!session) return null;
  session.status = 'complete';
  return session;
}