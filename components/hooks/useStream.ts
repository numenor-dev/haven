'use client';

import {
    useCallback,
    useRef
} from "react";
import {
    parseSSELine,
    getTextDelta,
    isMessageStop,
    isStreamError,
    isSessionComplete
} from "@/lib/streaming";
import {
    Message,
    StreamOptions,
    UseStreamProps,
    UseStreamReturn
} from "@/types/types";

export function useStream({ onChunk, onComplete, onSessionComplete, onError }: UseStreamProps): UseStreamReturn {
    const abortControllerRef = useRef<AbortController | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isTimedOut = useRef(false);

    const startStream = useCallback(
        async (messageHistory: Message[], options: StreamOptions) => {
            isTimedOut.current = false;
            abortControllerRef.current?.abort();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            abortControllerRef.current = new AbortController();
            timeoutRef.current = setTimeout(() => {
                isTimedOut.current = true;
                abortControllerRef.current?.abort();
            }, 180_000);

            let reader;

            try {
                const response = await fetch('/api/chat/stream', {
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
                if (!reader) throw new Error('No readable stream on response body');

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
                            }

                            if (isSessionComplete(chunk)) {
                                completed = true;
                                onSessionComplete();
                                return;
                            }
                           
                        } catch {
                            if (process.env.NODE_ENV === 'development') {
                                console.warn('[useStream] Failed to parse SSE line:', line);
                            }
                        }
                    }
                }

                if (!completed) onComplete();
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    if (isTimedOut.current) {
                        isTimedOut.current = false;
                        onError(new Error('Response timed out'))
                    }

                    return;  // abort is intentional since cancel is called
                }
                console.error('[useStream] Stream error:', error);
                onError(error instanceof Error ? error : new Error(String(error)));
            } finally {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
                reader?.cancel().catch(() => { });
            }
        },
        [onChunk, onComplete, onSessionComplete, onError]
    );

    const cancelStream = useCallback(() => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
    }, []);

    return { startStream, cancelStream };
}