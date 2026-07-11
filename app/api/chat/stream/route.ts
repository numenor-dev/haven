import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { after } from 'next/server';
import {
    getSession,
    incrementTurn,
    completeSession,
    isSessionAtLimit,
} from '@/lib/api/chatSessions';
import { handleApiError } from '@/lib/errors';
import { CompleteHook, StructuredData, TranscriptMessage } from '@/types/types';
import { updateChatRecord } from '@/lib/api/chatRecords';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const demoModel = 'claude-haiku-4-5-20251001';
const liveModel = 'claude-sonnet-4-6';

const demoPrompt = `
You are a warm, professional onboarding assistant for a personal injury law firm in Washington State.
Your job is to gather key facts an attorney needs before a first consultation. Never provide legal advice.
Be conversational and realistically empathetic. Many clients are stressed or in pain so being overally empathetic
can be frustrating.

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
You are running a 5 question demo onboarding session. The introduction should always be the one listed below.
The first question asked should always be the one listed below and then you will need to ask
contextually appropriate questions depending on their first answer. Never ask more than 5 total
questions. Never use special characters, emojis, or em dashes in any circumstance. The 5th question should
always be as follows: "Have you spoken to an attorney yet?"

Introduction: "Hello and welcome to The Law Group! Thank you for reaching out to us."

Initial question: "How can we help you?"

After the 5th answer, thank the client warmly, let them know the attorney will review
their information before the consultation, and end the session by saying exactly:
"Thank you for the information. We look forward to speaking with you soon."

Do not ask any further questions after this closing message.
`.trim();

// live prompt will be replaced in the near future with a more refined prompt;
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

const onboardingTools: Anthropic.Tool[] = [
    {
        name: 'extract_chat_session_data',
        description:
            'Call this when the personal injury onboarding conversation is fully complete. ' +
            'This extracts structured data for the attorney case report and closes the session. ' +
            'Only call this ONCE — after gathering all of: incident details, injuries sustained, ' +
            'medical treatment received, insurance status, and scheduling preference. ' +
            'Do not call this prematurely.',
        input_schema: {
            type: 'object' as const,
            properties: {
                client_identification: {
                    type: 'object',
                    description: 'Basic client details gathered during onboarding',
                    properties: {
                        full_name: { type: 'string' },
                        phone: { type: 'string' },
                        email: { type: 'string' },
                    },
                    required: ['full_name'],
                },
                incident_details: {
                    type: 'object',
                    description: 'Details about the incident that caused the injury',
                    properties: {
                        incident_type: {
                            type: 'string',
                            enum: [
                                'motor_vehicle_accident',
                                'slip_and_fall',
                                'workplace_injury',
                                'medical_malpractice',
                                'dog_bite',
                                'product_liability',
                                'wrongful_death',
                                'other',
                            ],
                        },
                        incident_date: {
                            type: 'string',
                            description: 'Date of the incident — exact or approximate',
                        },
                        incident_location: { type: 'string' },
                        incident_description: {
                            type: 'string',
                            description: 'What happened, in the client\'s own words',
                        },
                        police_report_filed: { type: 'boolean' },
                        witnesses_present: { type: 'boolean' },
                        photos_or_evidence: { type: 'boolean' },
                    },
                    required: ['incident_type', 'incident_description'],
                },
                injuries: {
                    type: 'object',
                    description: 'Injuries sustained by the client',
                    properties: {
                        injury_types: {
                            type: 'array',
                            items: {
                                type: 'string',
                                enum: [
                                    'soft_tissue',
                                    'broken_bones',
                                    'traumatic_brain_injury',
                                    'spinal_injury',
                                    'burns',
                                    'lacerations',
                                    'internal_injuries',
                                    'psychological_trauma',
                                    'wrongful_death',
                                    'other',
                                ],
                            },
                        },
                        injury_description: { type: 'string' },
                        current_medical_status: {
                            type: 'string',
                            enum: ['ongoing_treatment', 'recovered', 'recovering', 'permanent_disability', 'unknown'],
                        },
                        surgeries_required: { type: 'boolean' },
                        hospitalized: { type: 'boolean' },
                    },
                    required: ['injury_description'],
                },
                medical_treatment: {
                    type: 'object',
                    properties: {
                        providers_seen: {
                            type: 'string',
                            description: 'Medical providers, hospitals, and specialists seen',
                        },
                        estimated_medical_expenses: {
                            type: 'string',
                            enum: ['under_10k', '10k_to_50k', '50k_to_100k', 'over_100k', 'unknown'],
                        },
                        ongoing_treatment: { type: 'boolean' },
                        treatment_notes: { type: 'string' },
                    },
                },
                liability: {
                    type: 'object',
                    properties: {
                        at_fault_party: {
                            type: 'string',
                            description: 'Who was at fault — other driver, property owner, employer, etc.',
                        },
                        client_fault: {
                            type: 'string',
                            enum: ['none', 'minimal', 'partial', 'unknown'],
                            description: 'Client\'s perceived share of fault',
                        },
                        multiple_defendants: { type: 'boolean' },
                    },
                },
                insurance_information: {
                    type: 'object',
                    properties: {
                        client_has_insurance: { type: 'boolean' },
                        at_fault_party_insured: { type: 'boolean' },
                        claim_filed: { type: 'boolean' },
                        claim_status: {
                            type: 'string',
                            enum: ['not_filed', 'filed_pending', 'denied', 'settlement_offered', 'unknown'],
                        },
                        prior_settlement_offered: { type: 'boolean' },
                    },
                },
                damages: {
                    type: 'object',
                    properties: {
                        lost_wages: { type: 'boolean' },
                        time_missed_from_work: { type: 'string' },
                        occupation: { type: 'string' },
                        property_damage: { type: 'boolean' },
                        property_damage_description: { type: 'string' },
                        pain_and_suffering: {
                            type: 'string',
                            description: 'How the injury has affected the client\'s daily life',
                        },
                    },
                },
                prior_representation: {
                    type: 'object',
                    properties: {
                        spoken_with_other_attorneys: { type: 'boolean' },
                        has_existing_representation: { type: 'boolean' },
                        prior_claims_or_lawsuits: { type: 'boolean' },
                    },
                },
                scheduling_preference: {
                    type: 'object',
                    properties: {
                        preferred_times: {
                            type: 'string',
                            description: 'Days, times, or general availability',
                        },
                        preferred_format: {
                            type: 'string',
                            enum: ['in_person', 'video_call', 'phone_call', 'no_preference', 'unknown'],
                        },
                        urgency_to_consult: {
                            type: 'string',
                            enum: ['immediate', 'within_week', 'within_month', 'flexible'],
                        },
                        availability_notes: { type: 'string' },
                    },
                    required: ['preferred_format'],
                },
                complexity_flags: {
                    type: 'array',
                    description: 'Issues that may require extended consultation time or specialist attention',
                    items: {
                        type: 'object',
                        properties: {
                            topic: { type: 'string' },
                            reason: { type: 'string' },
                        },
                        required: ['topic', 'reason'],
                    },
                },
                session_metadata: {
                    type: 'object',
                    properties: {
                        conversation_summary: {
                            type: 'string',
                            description: '2-3 sentence summary of the case for the attorney',
                        },
                        statute_of_limitations_concern: {
                            type: 'boolean',
                            description: 'Flag true if the incident date suggests the SOL window may be closing',
                        },
                        additional_notes: { type: 'string' },
                    },
                    required: ['conversation_summary'],
                },
            },
            required: [
                'client_identification',
                'incident_details',
                'injuries',
                'scheduling_preference',
                'session_metadata',
            ],
        },
    },
];

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

                // Loop has exited after message_stop. Controller is still open.
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

// Route handler
export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null);
    const { sessionId, messages, transcript, slug, isDemo } = body ?? {};

    // Demo chat
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

    // clientName is stored at session creation in chatRecords, not needed per-turn.
    // slug is validated above; per-firm prompt injection reserved for V2.
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
            system: [{ type: 'text', text: livePrompt, cache_control: { type: 'ephemeral' } }],
            messages: messages.length === 0
                ? [{ role: 'user', content: 'Begin the chat session.' }]
                : messages,
            tools: onboardingTools,
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

                // Append the final assistant turn to the client transcript.
                // Extract text blocks only
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

                await updateChatRecord(session.id, toolBlock.input as StructuredData, completeTranscript);
                await completeSession(session.id);

                try {
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({ type: 'session_complete' })}\n\n`
                        )
                    );
                } catch {}
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