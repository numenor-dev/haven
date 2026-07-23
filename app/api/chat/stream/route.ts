import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { after } from 'next/server';
import {
    getSession,
    incrementTurn,
    completeSession,
    isSessionAtLimit,
} from '@/lib/api/chatSessions';
import { extractionTool } from '@/lib/api/extraction';
import { handleApiError } from '@/lib/errors';
import { CompleteHook, StructuredData, TranscriptMessage } from '@/types/types';
import { updateChatRecord } from '@/lib/api/chatRecords';
import { greeting } from '@/lib/utils';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const demoModel = 'claude-haiku-4-5-20251001';
const liveModel = 'claude-sonnet-4-6';

const demoPrompt = `
You are a warm, professional legal onboarding assistant for a law firm in Washington State.

Your goals and constraints are as follows:
- Gather key facts from the client before their initial consultation by asking a total of exactly 5 questions.
- Ask ONLY ONE question at a time. You must wait for the user to answer before asking the next question.
- Keep the tone realistically conversational, but brief. The client wants to complete this session quickly.
- The client has already provided their name and email address. Never ask for this information.

**The Conversation Flow (Dynamic Triage):**
- Question 1 (The Triage): Ask the user "How can we help you?". 
- Questions 2, 3, and 4 (The Fact-Finding): Based on the user's answer to Question 1, dynamically ask 3 distinct, highly relevant intake questions tailored to their specific legal need. 
  - If Personal Injury: Ask about the date of the incident, the type of injury, and if they have received medical treatment.
  - If Estate Planning: Ask about marital status, minor children, and real estate ownership.
  - If Family Law (Divorce/Custody): Ask if the other party has been served, if there are minor children, and if any court dates are pending.
  - If Business/Real Estate/Other: Ask for a brief summary of the dispute or transaction, the timeline, and their primary goal.
- Question 5 (Final Question): Regardless of practice area, you must ask this verbatim: "Have you spoken with an attorney about this yet?"

**Handling Legal Questions (Strict Rule):**
- If the user asks ANY questions about the law, their specific legal situation, or legal advice, you must instantly stop the normal flow and reply verbatim: "I cannot answer legal questions, but our attorneys can. May I have your phone number so an attorney can call you?" 

**Ending the Session:**
- After the user answers the 5th question, thank them warmly, let them know the legal team will review their information, and end the session by replying verbatim: "Thank you for the information. We look forward to speaking with you soon."
- Do not ask any further questions after this closing message.

**Formatting Rules:**
- Never use emojis, markdown formatting (like asterisks or bolding), hashtags, or em dashes. Use standard plain text punctuation only.
`.trim();

const livePrompt = demoPrompt;

const sessionLimitMessage = 'It looks this conversation has reached its limit. ' +
    'Please complete the session and an attorney will reach out as soon as possible.'

const sseHeaders = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
};

// Claude calls extract_chat_session_data when the onboarding conversation is complete.
// completeSession() is called and the session_complete SSE event.
// The tool input is PDF generation source of truth and is stored in chat_records.structured_data before PDF render.
// flag_complexity is consolidated here as complexity_flags[] rather than a separate tool call.


function jsonError(message: string, status: number): Response {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

// Hook fires after message_stop, before controller.close().
// This is the only window where the hook can emit additional SSE events to the client.
function buildStream(
    stream: ReturnType<typeof anthropic.messages.stream>,
    onMessageStop?: CompleteHook,
): ReadableStream {
    return new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            let inToolBlock = false;
            let isClientConnected = true;

            const safeEnqueue = (data: string) => {
                if (!isClientConnected) return;
                try {
                    controller.enqueue(encoder.encode(data));
                } catch {
                    isClientConnected = false;
                }
            };

            try {
                for await (const chunk of stream) {
                    if (chunk.type === 'content_block_start') {
                        if (chunk.content_block.type === 'tool_use') {
                            inToolBlock = true;
                            continue;
                        }
                    }
                    if (inToolBlock) {
                        if (chunk.type === 'content_block_stop') inToolBlock = false;
                        continue;
                    }

                    safeEnqueue(`data: ${JSON.stringify(chunk)}\n\n`);

                    if (chunk.type === 'message_stop') {
                        inToolBlock = false;
                    }
                }

                // Loop has exited after message_stop but controller is still open.
                // Run the completion hook before finally closes it.
                if (onMessageStop) await onMessageStop(controller, encoder);

                if (isClientConnected) {
                    try { controller.close(); } catch { }
                }

            } catch (streamError) {
                console.error('[stream route] Stream error:', streamError);
                if (isClientConnected) {
                    safeEnqueue(`data: ${JSON.stringify({ type: 'error', error: 'Stream interrupted' })}\n\n`);
                    try { controller.error(streamError); } catch { }
                }
            }
        },
    });
}

// Stream route
export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null);
    const {
        sessionId,
        messages,
        transcript,
        slug,
        clientName,
        firmName,
        phone,
        email,
        localHour,
        isDemo
    } = body ?? {};

    // Demo chat
    if (isDemo) {
        if (!Array.isArray(messages)) {
            return jsonError('messages must be an array', 400);
        }

        try {
            const stream = anthropic.messages.stream({
                model: demoModel,
                max_tokens: 2048,
                system: [
                    {
                        type: 'text',
                        text: demoPrompt,
                        cache_control: { type: 'ephemeral' }
                    },
                    {
                        type: 'text',
                        text: `${greeting(localHour ?? new Date().getUTCHours())}.
                        You are speaking to a potential client so the greeting needs to be as follows after the time of day greeting:
                        "Thank you for reaching out to us!"`,
                    },
                ],
                messages: messages.length === 0
                    ? [{ role: 'user', content: 'Begin the chat session.' }]
                    : messages,
            });

            stream.on('message', (message) => {
                console.log('[Anthropic usage] demo:', message.usage);
            });

            return new Response(buildStream(stream), { headers: sseHeaders });

        } catch (error) {
            console.error('[stream route] Demo stream error:', error);
            if (error instanceof Anthropic.APIError) return jsonError(error.message, error.status);
            return jsonError('Internal server error', 500);
        }
    }

    // Live chat
    if (!sessionId || typeof sessionId !== 'string') {
        return jsonError('sessionId is required', 400);
    }
    if (!Array.isArray(messages)) {
        return jsonError('messages must be an array', 400);
    }
    if (!slug || typeof slug !== 'string') {
        return jsonError('slug is required', 400);
    }

    if (!clientName || typeof clientName !== 'string') return jsonError('clientName is required', 400);
    if (!firmName || typeof firmName !== 'string') return jsonError('firmName is required', 400);

    // clientName and firmName are injected into the dynamic system block each turn.
    // phone and email are passed through for client_identification overlay at session completion.
    let session;
    try {
        session = await getSession(sessionId);
    } catch (err) {
        return handleApiError(err);
    }

    if (session.status === 'complete') {
        return jsonError('Session already complete', 409);
    }

    if (isSessionAtLimit(session)) {
        await completeSession(session.id).catch((err) =>
            console.error('[stream route] completeSession failed on limit hit:', err)
        );
        return jsonError(sessionLimitMessage, 410);
    }

    try {
        const stream = anthropic.messages.stream({
            model: liveModel,
            max_tokens: 2048,
            system: [
                {
                    type: 'text',
                    text: livePrompt,
                    cache_control: { type: 'ephemeral' },
                },
                {
                    type: 'text',
                    text: `Please use the following greeting: 
                    "${greeting(localHour ?? new Date().getUTCHours())}, ${clientName}.
                    Thank you for contacting ${firmName}. How can we help you today?"`
                },
            ],
            messages: messages.length === 0
                ? [{ role: 'user', content: 'Begin the chat session.' }]
                : messages,
            tools: [extractionTool],
        });

        stream.on('message', (message) => {
            const promise = incrementTurn(session.id).catch((err) =>
                console.error('[stream route] incrementTurn failed:', err)
            );
            console.log('[Anthropic usage] live:', message.usage);
            after(() => promise);
        });

        const completeHook: CompleteHook = async (controller, encoder) => {
            try {
                const finalMessage = await stream.finalMessage();
                const toolBlock = finalMessage.content.find(
                    (b): b is Anthropic.ToolUseBlock =>
                        b.type === 'tool_use' && b.name === 'extract_chat_session_data'
                );

                if (!toolBlock) return;

                // Append the final assistant turn to the client transcript
                const finalText = finalMessage.content
                    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
                    .map(b => b.text)
                    .join('');

                const completeTranscript: TranscriptMessage[] = [
                    ...(Array.isArray(transcript) ? transcript : messages),
                    ...(finalText ? [{
                        role: 'assistant' as const,
                        content: finalText,
                        timestamp: new Date().toISOString(),
                    }] : []),
                ];

                const rawData = toolBlock.input as StructuredData;
                const structuredData: StructuredData = {
                    ...rawData,
                    client_identification: {
                        full_name: clientName ?? rawData.client_identification?.full_name ?? '',
                        phone: phone || rawData.client_identification?.phone,
                        email: email || rawData.client_identification?.email,
                    },
                };
                await updateChatRecord(session.id, structuredData, completeTranscript);
                await completeSession(session.id);

                try {
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({ type: 'session_complete' })}\n\n`
                        )
                    );
                } catch { }
            } catch (err) {
                console.error('[stream route] Completion pipeline failed:', err);
                // Session remains active if this fails.
            }
        };

        return new Response(buildStream(stream, completeHook), { headers: sseHeaders });

    } catch (error) {
        console.error('[stream route] Live stream error:', error);
        if (error instanceof Anthropic.APIError) return jsonError(error.message, error.status);
        return jsonError('Internal server error', 500);
    }
}