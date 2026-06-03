export type SessionStatus = "idle" | "streaming" | "user_turn" | "complete"

export type Message = {
    role: "user" | "assistant"
    content: string
}

export type IntakeSessionProps = {
    firm?: string;
    isDemo?: boolean;
    isActive?: boolean;
}

export type IntakeSessionReturn = {
    status: SessionStatus;
    messages: Message[];
    sessionId: string | null;
    start: () => void;
    sendMessage: (content: string) => void;
    cancelStream: () => void;
}

export type StreamChunk = {
    type: "content_block_delta" | "message_stop" | "message_start"
    delta?: {
        type: "text_delta"
        text: string
    }
}

export type UseStreamProps = {
    onChunk: (text: string) => void;
    onComplete: () => void;
    onError: (error: Error) => void;
}

export type StreamOptions = {
    firm?: string;
    isDemo?: boolean;
}

export type UseStreamReturn = {
    startStream: (messageHistory: Message[], options: StreamOptions) => void;
    cancelStream: () => void;
}