import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db/db';
import { attorneys, firms } from '@/lib/db/schema';
import {
    handleApiError
} from '@/lib/errors';
import {
    createSession,
    getSession,
    completeSession
} from '@/lib/api/chatSessions';


export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null);
    const firmSlug = body?.firmSlug;

    if (!firmSlug || typeof firmSlug !== 'string') {
        return NextResponse.json({ error: 'firmSlug is required' }, { status: 400 });
    }

    let attorneyId: string | undefined;

    const { data: authSession } = await auth.getSession();
    if (authSession?.user) {
        const [attorney] = await db
            .select({ id: attorneys.id, firmSlug: firms.slug })
            .from(attorneys)
            .innerJoin(firms, eq(attorneys.firmId, firms.id))
            .where(eq(attorneys.neonAuthUserId, authSession.user.id));

        // Attorney visiting their own firm's URL counts as their one free trial
        if (attorney && attorney.firmSlug === firmSlug) {
            attorneyId = attorney.id;
        }
    }

    try {
        const session = await createSession(firmSlug, attorneyId);
        return NextResponse.json(session, { status: 201 });
    } catch (err) {
        return handleApiError(err);
    }
}

export async function GET(req: NextRequest) {
    const sessionId = req.nextUrl.searchParams.get('sessionId');
    if (!sessionId) {
        return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    try {
        const session = await getSession(sessionId);
        return NextResponse.json(session);
    } catch (err) {
        return handleApiError(err);
    }
}

export async function PATCH(req: NextRequest) {
    const body = await req.json().catch(() => null);
    const sessionId = body?.sessionId;
    if (!sessionId || typeof sessionId !== 'string') {
        return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    try {
        const currentSession = await getSession(sessionId); // throws if current session is not found
        if (currentSession.status === 'complete') {
            return NextResponse.json({ error: 'Session already complete' }, { status: 409 });
        }
        const session = await completeSession(sessionId);
        return NextResponse.json(session);
    } catch (err) {
        return handleApiError(err);
    }
}