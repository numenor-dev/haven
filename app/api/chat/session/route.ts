import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/db';
import { firms } from '@/lib/db/schema';
import {
    handleApiError,
    TrialExhaustedError,
    FirmNotFoundError
} from '@/lib/errors';
import {
    createSession,
    getSession,
    completeSession
} from '@/lib/api/chatSessions';
import { extractChatData } from '@/lib/api/extraction';
import { completeChatRecord } from '@/lib/api/chatRecords';

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null);
    const { slug, clientName } = body ?? {};

    if (!slug || typeof slug !== 'string') {
        return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    if (!clientName || typeof clientName !== 'string') {
        return NextResponse.json({ error: 'Client name is required' }, { status: 400 });
    }

    try {
        const [firm] = await db
            .select({
                id: firms.id,
                slug: firms.slug,
                isTrialUsed: firms.trialUsed,
                activeSubscription: firms.hasActiveSubscription
            })
            .from(firms)
            .where(eq(firms.slug, slug));

        if (!firm) {
            throw new FirmNotFoundError(slug);
        }

        if (firm.isTrialUsed && !firm.activeSubscription) {
            throw new TrialExhaustedError();
        }

        const session = await createSession(slug, clientName);
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
    const { sessionId, transcript, clientName, clientPhone, clientEmail } = body;

    if (!sessionId || typeof sessionId !== 'string') {
        return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }
    if (!Array.isArray(transcript) || transcript.length === 0) {
        return NextResponse.json({ error: 'transcript is required' }, { status: 400 });
    }

    try {
        const session = await completeSession(sessionId);

        const structuredData = await extractChatData(transcript, {
            clientName,
            clientPhone,
            clientEmail
        });

        await completeChatRecord(sessionId, { structuredData, transcript, clientName });

        return NextResponse.json(session);
    } catch (err) {
        return handleApiError(err);
    }
}