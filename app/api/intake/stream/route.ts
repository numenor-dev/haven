import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { Message } from "@/types/types";

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const demoPrompt = `
You are a warm, professional intake assistant for a personal injury law firm in Washington State.
Your job is to gather the key facts an attorney needs before a first consultation. Never provide
legal advice. Be conversational and empathetic; many clients are stressed or in pain.

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
You are running a 5 question demo intake. Ask exactly these questions in order,
one at a time. Do not ask follow-up questions or deviate from the script since this is a demo.

1. "To get started, can you briefly describe what happened and how you were injured?"
2. "When did the incident occur, and have you received any medical treatment so far?"
3. "Were any other parties involved?"
4. "What is your current insurance situation? For example, do you have PIP coverage,
   and have you been in contact with any insurance companies yet?"

After the 5th answer, thank the client warmly, let them know the attorney will review
their information before the consultation, and end the session by saying exactly:
"Thank you for the information. We look forward to speaking with you soon."

Do not ask any further questions after this closing message.
`.trim();

// TODO: Replace with full RAG-backed system prompt when private backend is ready
const livePrompt = demoPrompt;


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { messages, firm, isDemo } = body as {
            messages: Message[];
            firm?: string;
            isDemo?: boolean;
        };

        const systemPrompt = isDemo ? demoPrompt : livePrompt;
        // Use Haiku for demo (cost) and Sonnet for real sessions (quality)
        const model = isDemo
            ? "claude-haiku-4-5-20251001"
            : "claude-sonnet-4-6";

        const stream = await anthropic.messages.stream({
            model,
            max_tokens: 1024,
            system: systemPrompt,
            messages,
        });

        // Pipe the Anthropic stream back to the client as SSE
        const readable = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();

                try {
                    for await (const chunk of stream) {
                        const line = `data: ${JSON.stringify(chunk)}\n\n`;
                        controller.enqueue(encoder.encode(line));

                        // Close cleanly on message_stop — client loop will break
                        if (chunk.type === "message_stop") {
                            break;
                        }
                    }
                } catch (streamError) {
                    console.error("[stream route] Stream error:", streamError);
                    // Send a well-formed error event so the client can handle it
                    const errorEvent = `data: ${JSON.stringify({ type: "error", error: "Stream interrupted" })}\n\n`;
                    controller.enqueue(encoder.encode(errorEvent));
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(readable, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-transform",
                "Connection": "keep-alive",
                // Firm context passed through for future use (logging, branding, RAG scope)
                ...(firm && { "X-Haven-Firm": firm }),
            },
        });
    } catch (error) {
        console.error("[stream route] Request error:", error);

        if (error instanceof Anthropic.APIError) {
            return new Response(
                JSON.stringify({ error: error.message }),
                { status: error.status, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}