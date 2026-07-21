import { chatSessions, chatRecords } from "@/lib/db/schema"
import { RefObject } from "react";

export type SessionStatus = "idle" | "active" | "streaming" | "user_turn" | "complete" | "expired" | "error"

export type Message = {
    role: "user" | "assistant"
    content: string;
    timestamp?: string;
}

export type LiveChatProps = {
    slug: string;
    firmName: string;
}

export type LiveSessionProps = {
    slug: string;
    clientInfo: { name: string; phone: string; email: string } | null;
    firmName: string;
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
    manualEndSession: () => void;
    cancel: () => void;
    textRef: RefObject<HTMLSpanElement | null>;
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
    textRef: RefObject<HTMLSpanElement | null>;
}

export type StreamChunk =
    | { type: "content_block_delta"; delta: { type: "text_delta"; text: string } }
    | { type: "message_stop" }
    | { type: "session_complete" }
    | { type: "error"; error: string }

export type UseStreamProps = {
    onChunk: (text: string) => void;
    onComplete: () => void;
    onSessionComplete: () => void;
    onError: (error: Error) => void;
}

export type StreamOptions =
    | {
        isDemo: true;
        localHour: number;
    }
    | {
        slug: string;
        sessionId: string;
        transcript: TranscriptMessage[];
        clientName: string;
        firmName: string;
        phone?: string;
        email?: string;
        localHour: number;
    };

export type UseStreamReturn = {
    startStream: (messageHistory: Message[], options: StreamOptions) => void;
    cancelStream: () => void;
}

export type TranscriptMessage = {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string
};

export type DashboardHeaderProps = {
    firmName: string;
    slug: string;
    trialStatus: boolean;
}

export type DataPanelProps = {
    record: ChatRecordsData | null;
    userName: string | null;
};

export type FirmSummary = {
    id: string;
    firmName: string;
    slug: string;
    trialUsed: boolean;
    activeSubscription: boolean;
};

export type CreateChatRecord = {
    sessionId: string;
    firmId: string;
    clientName: string;
};

export type FieldProps = {
    label: string;
    value: string;
    className?: string
};

export type SectionProps = {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    cols?: 1 | 2
};

export type StructuredData = {
    client_identification: {
        full_name: string;
        phone?: string;
        email?: string;
    };
    family_situation?: {
        marital_status?: 'single' | 'married' | 'divorced' | 'widowed' | 'domestic_partnership' | 'unknown';
        has_children?: boolean;
        number_of_children?: number;
        has_dependents?: boolean;
        dependent_notes?: string;
    };
    assets_overview?: {
        has_real_estate?: boolean;
        has_business_interests?: boolean;
        has_retirement_accounts?: boolean;
        has_life_insurance?: boolean;
        estimated_estate_size?: 'under_500k' | '500k_to_1m' | '1m_to_5m' | 'over_5m' | 'unknown';
        asset_notes?: string;
    };
    existing_documents?: {
        has_existing_will?: boolean;
        has_trust?: boolean;
        has_power_of_attorney?: boolean;
        has_healthcare_directive?: boolean;
        documents_notes?: string;
    };
    planning_goals?: {
        avoid_probate?: boolean;
        minimize_taxes?: boolean;
        charitable_giving?: boolean;
        business_succession?: boolean;
        goals_notes?: string;
    };
    scheduling_preference: {
        preferred_format: 'in_person' | 'video_call' | 'phone_call' | 'no_preference' | 'unknown';
        preferred_times?: string;
        urgency_to_consult?: 'immediate' | 'within_week' | 'within_month' | 'flexible';
        availability_notes?: string;
    };
    session_metadata: {
        conversation_summary: string;
        complexity_flags?: Array<{ topic: string; reason: string }>;
        additional_notes?: string;
    };
};

export type CompleteChatRecord = {
    transcript: TranscriptMessage[];
    structuredData: StructuredData | null;
    pdfUrl?: string | null;
    clientName: string;
};

export type CompleteHook = (
    controller: ReadableStreamDefaultController<Uint8Array>,
    encoder: TextEncoder,
) => Promise<void>;

export type TranscriptSectionProps = {
    transcript: Message[] | null;
    open: boolean;
    onToggle: () => void;
};

export type ActionResult = { success: true } | { success: false; error: string };