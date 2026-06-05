export type SessionStatus = "idle" | "streaming" | "user_turn" | "complete" | "error"

export type Message = {
    role: "user" | "assistant"
    content: string
}

export type LiveSessionProps = {
    firm: string;
}

export type DemoSessionProps = {
    isActive: boolean;
}

export type LiveSessionReturn = {
    status: SessionStatus;
    messages: Message[];
    error: Error | null;
    sessionId: string | null;
    start: () => void;
    sendMessage: (content: string) => void;
    cancel: () => void;
}

export type DemoSessionReturn = {
    status: SessionStatus;
    messages: Message[];
    error: Error | null;
    sendMessage: (content: string) => void;
    cancel: () => void;
    reset: () => void;
}

export type StreamChunk =
    | { type: "content_block_delta"; delta: { type: "text_delta"; text: string } }
    | { type: "message_stop" }
    | { type: "message_start" }
    | { type: "error"; error: string }

export type UseStreamProps = {
    onChunk: (text: string) => void;
    onComplete: () => void;
    onError: (error: Error) => void;
}

export type StreamOptions =
    | { isDemo: true }
    | { firm: string; sessionId: string | null }

export type UseStreamReturn = {
    startStream: (messageHistory: Message[], options: StreamOptions) => void;
    cancelStream: () => void;
}