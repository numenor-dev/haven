import { NextRequest, NextResponse } from 'next/server';
import {
    createSession,
    getSession,
    completeSession
} from '@/lib/api/sessionStates';


export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null);
    const firmSlug = body?.firmSlug;

    if (!firmSlug || typeof firmSlug !== 'string') {
        return NextResponse.json({ error: 'firmSlug is required' }, { status: 400 });
    }

    // TODO: validate firmSlug exists in DB once backend is live
    // const firm = await getFirmBySlug(firmSlug);
    // if (!firm) return NextResponse.json({ error: 'Firm not found' }, { status: 404 });

    // TODO: check trial_used on user record once auth is wired in
    // if (firmSlug === TRIAL_SLUG && session.user.trial_used) {
    //   return NextResponse.json({ error: 'Trial already used' }, { status: 403 });
    // }

    const session = await createSession(firmSlug);
    return NextResponse.json(session, { status: 201 });
}

export async function GET(req: NextRequest) {
    const sessionId = req.nextUrl.searchParams.get('sessionId');

    if (!sessionId || typeof sessionId !== 'string') {
        return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const session = await getSession(sessionId);
    if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(session);
}

export async function PATCH(req: NextRequest) {
    const body = await req.json().catch(() => null);
    const sessionId = body?.sessionId;

    if (!sessionId || typeof sessionId !== 'string') {
        return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const currentSession = await getSession(sessionId);
    if (!currentSession) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    if (currentSession.status === 'complete') {
        return NextResponse.json({ error: 'Session already complete' }, { status: 409 });
    }

    const session = await completeSession(sessionId);
    return NextResponse.json(session);
}