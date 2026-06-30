import { chatSessions, chatRecords } from "@/lib/db/schema"

export type SessionStatus = "idle" | "active" | "streaming" | "user_turn" | "complete" | "expired" | "error"

export type Message = {
    role: "user" | "assistant"
    content: string
}

export type LiveChatProps = {
    slug: string;
    firmName: string;
}

export type LiveSessionProps = {
    slug: string;
    clientName: string;
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

export type ChatRecord = typeof chatRecords.$inferSelect;

export type ChatRecordsListItem = Pick<ChatRecord, 'id' | 'clientName' | 'status' | 'createdAt'>;

export type ChatRecordsData = Pick<ChatRecord,
  | 'id' | 'clientName' | 'status' | 'createdAt'
  | 'sessionId' | 'pdfUrl' | 'updatedAt' | 'completedAt'
  | 'transcript' | 'structuredData'
>;

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
    | { slug: string; sessionId: string | null }

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

export type FirmSummary = {
  id: string;
  firmName: string;
};

export type CreateChatRecord = {
  sessionId: string;
  firmId: string;
  clientName: string;
};

export type CompleteChatRecord = {
  transcript: TranscriptMessage[];
  structuredData: StructuredData;
  pdfUrl: string;
};