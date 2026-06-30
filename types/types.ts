import { chatSessions } from "@/lib/db/schema"

export type SessionStatus = "idle" | "active" | "streaming" | "user_turn" | "complete" | "expired" | "error"

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

export type ChatSession = typeof chatSessions.$inferSelect;


export type LiveSessionReturn = {
    status: SessionStatus;
    messages: Message[];
    error: Error | null;
    sessionId: string | null;
    sendMessage: (content: string) => void;
    cancel: () => void;
}

export type ChatRecordsStatus = 'new' | 'reviewed'

export type ChatRecordsListItem = {
    id: string;
    clientName: string | null;
    status: ChatRecordsStatus;
    createdAt: Date;
};

export type ChatRecordsData = ChatRecordsListItem & {
    sessionId: string;
    pdfUrl: string | null;
    updatedAt: Date | null;
    completedAt: Date | null;
    transcript: TranscriptMessage[];
    structuredData: StructuredData | null;
};
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

export type TranscriptMessage = {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string
};
export type StructuredData = {
    summary: string;
    actionItems: string[]
};

export type DashboardHeaderProps = {
    firmName: string | null;
}

export type DataPanelProps = {
    record: ChatRecordsData | null;
    userName: string | null;
};