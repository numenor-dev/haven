'use client';

import {
    useCallback,
    useRef
} from "react";
import {
    parseSSELine,
    getTextDelta,
    isMessageStop,
    isStreamError
} from "@/lib/streaming";
import {
    Message,
    StreamOptions,
    UseStreamProps,
    UseStreamReturn
} from "@/types/types";

export function useStream({ onChunk, onComplete, onError }: UseStreamProps): UseStreamReturn {
    const abortControllerRef = useRef<AbortController | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const startStream = useCallback(
        async (messageHistory: Message[], options: StreamOptions) => {
            // Cancel any in-flight stream before starting a new one
            abortControllerRef.current?.abort();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            abortControllerRef.current = new AbortController();
            timeoutRef.current = setTimeout(() => abortControllerRef.current?.abort(), 15_000);

            let reader;

            try {
                const response = await fetch("/api/chat/stream", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        messages: messageHistory,
                        ...options,
                    }),
                    signal: abortControllerRef.current.signal,
                });

                if (!response.ok) {
                    throw new Error(`Stream request failed: ${response.status}`);
                }

                reader = response.body?.getReader();
                if (!reader) throw new Error("No readable stream on response body");

                const decoder = new TextDecoder();
                let lineBuffer = '';
                let completed = false;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    lineBuffer += decoder.decode(value, { stream: true })

                    const lines = lineBuffer.split('\n');
                    lineBuffer = lines.pop() ?? '';

                    for (const line of lines) {
                        try {
                            const chunk = parseSSELine(line);
                            if (!chunk) continue;

                            const text = getTextDelta(chunk);
                            if (text) onChunk(text);

                            if (isStreamError(chunk)) {
                                onError(new Error(chunk.error));
                                return;
                            }

                            if (isMessageStop(chunk)) {
                                completed = true;
                                onComplete();
                                return;
                            }
                            // parseSSELine handles JSON parse errors internally and this catches unexpected throws
                        } catch {
                            if (process.env.NODE_ENV === "development") {
                                console.warn("[useStream] Failed to parse SSE line:", line);
                            }
                        }
                    }
                }

                if (!completed) onComplete();
            } catch (error) {
                reader?.cancel();
                // AbortError is intentional since cancel is called
                if (error instanceof DOMException && error.name === "AbortError") return;
                console.error("[useStream] Stream error:", error);
                onError(error instanceof Error ? error : new Error(String(error)));
            } finally {
                clearTimeout(timeoutRef.current ?? undefined);
                timeoutRef.current = null;
            }
        },
        [onChunk, onComplete, onError]
    );

    const cancelStream = useCallback(() => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
    }, []);

    return { startStream, cancelStream };
}