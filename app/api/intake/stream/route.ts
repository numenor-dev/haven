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

// TODO: Replace with full RAG-backed system prompt when private backend is ready
const livePrompt = demoPrompt;
const demoModel = "claude-haiku-4-5-20251001";  // cost-optimized for demo
const liveModel = "claude-sonnet-4-6";   // quality for live sessions



export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { messages, firm, isDemo } = body as {
            messages: Message[];
            firm?: string;
            isDemo?: boolean;
        };

        if (!isDemo && !firm) {
            return new Response(
                JSON.stringify({ error: "firm is required for live sessions"}),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const systemPrompt = isDemo ? demoPrompt : livePrompt;
        
        const model = isDemo ? demoModel : liveModel;

        const stream = await anthropic.messages.stream({
            model,
            max_tokens: 2048,
            system: systemPrompt,
            messages: messages.length === 0
            ? [{ role: "user", content: "Begin the chat session." }]
            : messages,
        });

        // Pipe the Anthropic stream back to the client as SSE
        const readable = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();

                try {
                    for await (const chunk of stream) {
                        const line = `data: ${JSON.stringify(chunk)}\n\n`;
                        controller.enqueue(encoder.encode(line));

                        if (chunk.type === "message_stop") {
                            break;
                        }
                    }
                } catch (streamError) {
                    console.error("[stream route] Stream error:", streamError);
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