import { StreamChunk } from "@/types/types";


export function parseSSELine(line: string): StreamChunk | null {
    if (!line.startsWith('data: ') || line === 'data: [DONE]') return null;

    try {
        const parsed = JSON.parse(line.slice(6));
        const knownTypes = ["content_block_delta", "message_stop", "message_start", "error"];
        if (!knownTypes.includes(parsed.type)) return null;
        return parsed as StreamChunk;
    } catch {
        return null;
    }
}

export function getTextDelta(chunk: StreamChunk): string | null {
    if (chunk.type !== "content_block_delta") return null;
    return chunk.delta.text ?? null;
}

export function isMessageStop(chunk: StreamChunk) {
    if (chunk.type === "message_stop") return true;
}

export function isStreamError(chunk: StreamChunk): chunk is { type: "error"; error: string } {
    return chunk.type === "error";
}