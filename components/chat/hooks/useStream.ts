'use client';

import { useCallback, useRef } from "react";
import {
    Message,
    StreamChunk,
    StreamOptions,
    UseStreamProps,
    UseStreamReturn
} from "@/types/types";

export function useStream({ onChunk, onComplete, onError }: UseStreamProps): UseStreamReturn {
    const abortControllerRef = useRef<AbortController | null>(null);

    const startStream = useCallback(
        async (messageHistory: Message[], options: StreamOptions) => {
            // Cancel any in-flight stream before starting a new one
            abortControllerRef.current?.abort();
            abortControllerRef.current = new AbortController();

            try {
                const response = await fetch("/api/intake/stream", {
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

                const reader = response.body?.getReader();
                if (!reader) throw new Error("No readable stream on response body");

                const decoder = new TextDecoder();

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const lines = decoder
                        .decode(value)
                        .split("\n")
                        .filter((line) => line.startsWith("data: "));

                    for (const line of lines) {
                        try {
                            const parsed: StreamChunk = JSON.parse(line.slice(6));

                            if (
                                parsed.type === "content_block_delta" &&
                                parsed.delta?.type === "text_delta" &&
                                parsed.delta.text
                            ) {
                                onChunk(parsed.delta.text);
                            }

                            if (parsed.type === "message_stop") {
                                onComplete();
                                return;
                            }
                        } catch {
                            if (process.env.NODE_ENV === "development") {
                                console.warn("[useStream] Failed to parse SSE line:", line);
                            }
                        }
                    }
                }

                // Reader finished without a message_stop — treat as complete
                onComplete();
            } catch (error) {
                // AbortError is intentional (cancelStream called) — not an error
                if (error instanceof DOMException && error.name === "AbortError") return;
                console.error("[useStream] Stream error:", error);
                onError(error instanceof Error ? error : new Error(String(error)));
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