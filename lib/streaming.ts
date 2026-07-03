import { StreamChunk } from "@/types/types";

const knownChunkTypes = new Set([
    'content_block_delta',
    'message_stop',
    'session_complete',
    'error',
]);

export function parseSSELine(line: string): StreamChunk | null {
    if (!line.startsWith('data: ') || line === 'data: [DONE]') return null;

    try {
        const parsed = JSON.parse(line.slice(6));
        if (!knownChunkTypes.has(parsed.type)) return null;
        return parsed as StreamChunk;
    } catch {
        return null;
    }
}

export function getTextDelta(chunk: StreamChunk): string | null {
    if (chunk.type !== "content_block_delta") return null;
    if (chunk.delta.type !== 'text_delta') return null;
    return chunk.delta.text ?? null;
}

export function isMessageStop(chunk: StreamChunk): boolean {
    return chunk.type === "message_stop";
}

export function isSessionComplete(chunk: StreamChunk): boolean {
    return chunk.type === 'session_complete';
}

export function isStreamError(chunk: StreamChunk): chunk is { type: "error"; error: string } {
    return chunk.type === "error";
}