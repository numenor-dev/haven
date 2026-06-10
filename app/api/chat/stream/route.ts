import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import {
    getSession,
    incrementTurn,
    isTrialExhausted,
} from "@/lib/api/sessionStates";

const demoPrompt = `
You are a warm, professional intake assistant for a personal injury law firm in Washington State.
Your job is to gather the key facts an attorney needs before a first consultation. Never provide
legal advice. Be conversational and empathetic since many clients are stressed or in pain.

JURISDICTION CONTEXT — WASHINGTON STATE:
- Statute of limitations: 3 years from the date of injury (RCW 4.16.080). If the incident
  was recent, reassure the client there is time. If it is approaching 3 years, note that
  the attorney will want to discuss urgency.
- Pure comparative fault state: a client can recover damages even if partially at fault,
  though their award is reduced by their percentage of fault. Do not discourage clients
  who think they were partly responsible.
- PIP (Personal Injury Protection): Washington insurers are required to offer PIP coverage
  on auto policies. Ask about PIP status for any auto accident case.
- Common case types in Washington: auto accidents, slip and fall (premises liability),
  dog bites (strict liability under RCW 16.08.040), and workplace injuries (L&I / workers comp).

DEMO INSTRUCTIONS:
You are running a 5 question demo intake. The introduction should always be the one listed below.
The first question asked should always be the one listed below and then you will need to ask
contextually appropriate questions depending on their first answer. Never ask more than 5 total
questions. Never use special characters or emojis in any circumstance. The 5th question should
always be as follows: "Have you spoken to an attorney yet?"

Introduction: "Hello and welcome to Select Law Group! Thank you for reaching out to us."

Initial question: "How can we help you?"

After the 5th answer, thank the client warmly, let them know the attorney will review
their information before the consultation, and end the session by saying exactly:
"Thank you for the information. We look forward to speaking with you soon."

Do not ask any further questions after this closing message.
`.trim();

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Live prompt will be much more refined when DB is spun up
const livePrompt = demoPrompt;
const demoModel = "claude-haiku-4-5-20251001";  // lower cost for demo
const liveModel = "claude-sonnet-4-6";   // quality for live sessions

const sseHeaders = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
};

function jsonError(message: string, status: number): Response {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
};

function buildStream(
    stream: ReturnType<typeof anthropic.messages.stream>
): ReadableStream {
    return new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            try {
                for await (const chunk of stream) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
                    if (chunk.type === 'message_stop') break;
                }
            } catch (streamError) {
                console.error('[stream route] Stream error:', streamError);
                controller.enqueue(
                    encoder.encode(
                        `data: ${JSON.stringify({ type: 'error', error: 'Stream interrupted' })}\n\n`
                    )
                );
            } finally {
                controller.close();
            }
        },
    });
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null);
    const { sessionId, messages, firm, isDemo } = body ?? {};

    if (isDemo) {
        if (!Array.isArray(messages)) {
            return jsonError('messages must be an array', 400);
        }

        try {
            const stream = anthropic.messages.stream({
                model: demoModel,
                max_tokens: 2048,
                system: [{ type: 'text', text: demoPrompt, cache_control: { type: 'ephemeral' } }],
                messages: messages.length === 0
                    ? [{ role: 'user', content: 'Beging the chat session.' }]
                    : messages,
            });

            stream.on('message', (message) => {
                console.log('[Anthropic usage] demo:', message.usage);
            });

            return new Response(buildStream(stream), { headers: sseHeaders });
        } catch (error) {
            console.error('[stream route] Live request error:', error);
            if (error instanceof Anthropic.APIError) {
                return jsonError(error.message, error.status);
            }
            return jsonError('Internal server error', 500);
        }
    }

    if (!sessionId || typeof sessionId !== 'string') {
        return jsonError('sessionId is required', 400);
    }
    if (!Array.isArray(messages)) {
        return jsonError('messages must be an array', 400);
    }
    if (!firm || typeof firm !== 'string') {
        return jsonError('firm is required for live sessions', 400);
    }

    const session = await getSession(sessionId);
    if (!session) {
        return jsonError('Session not found', 404);
    }
    if (session.status === 'complete') {
        return jsonError('Session already complete', 409);
    }
    if (isTrialExhausted(session)) {
        return jsonError('Trial session limit reached', 429);
    }

    try {
        const stream = anthropic.messages.stream({
            model: liveModel,
            max_tokens: 2048,
            system: [{ type: 'text', text: livePrompt, cache_control: { type: 'ephemeral' } }],
            messages: messages.length === 0
                ? [{ role: 'user', content: 'Begin the chat session.' }]
                : messages,
        });

        stream.on('message', (message) => {
            incrementTurn(session.id).catch((err) =>
                console.error('[stream route] incrementTurn failed:', err)
            );
            console.log('[Anthropic usage] live:', message.usage);
        });

        return new Response(buildStream(stream), { headers: sseHeaders });
    } catch (error) {
        console.error('[stream route] Live request error:', error);
        if (error instanceof Anthropic.APIError) {
            return jsonError(error.message, error.status);
        }
        return jsonError('Internal server error', 500);
    }
}