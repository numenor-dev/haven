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

type IncidentType =
    | 'motor_vehicle_accident'
    | 'slip_and_fall'
    | 'workplace_injury'
    | 'medical_malpractice'
    | 'dog_bite'
    | 'product_liability'
    | 'wrongful_death'
    | 'other';

type InjuryType =
    | 'soft_tissue'
    | 'broken_bones'
    | 'traumatic_brain_injury'
    | 'spinal_injury'
    | 'burns'
    | 'lacerations'
    | 'internal_injuries'
    | 'psychological_trauma'
    | 'wrongful_death'
    | 'other';

export type StructuredData = {
    client_identification: {
        full_name: string;
        phone?: string;
        email?: string;
    };
    incident_details: {
        incident_type: IncidentType;
        incident_description: string;
        incident_date?: string;
        incident_location?: string;
        police_report_filed?: boolean;
        witnesses_present?: boolean;
        photos_or_evidence?: boolean;
    };
    injuries: {
        injury_description: string;
        injury_types?: InjuryType[];
        current_medical_status?: 'ongoing_treatment' | 'recovered' | 'recovering' | 'permanent_disability' | 'unknown';
        surgeries_required?: boolean;
        hospitalized?: boolean;
    };
    medical_treatment?: {
        providers_seen?: string;
        estimated_medical_expenses?: 'under_10k' | '10k_to_50k' | '50k_to_100k' | 'over_100k' | 'unknown';
        ongoing_treatment?: boolean;
        treatment_notes?: string;
    };
    liability?: {
        at_fault_party?: string;
        client_fault?: 'none' | 'minimal' | 'partial' | 'unknown';
        multiple_defendants?: boolean;
    };
    insurance_information?: {
        client_has_insurance?: boolean;
        at_fault_party_insured?: boolean;
        claim_filed?: boolean;
        claim_status?: 'not_filed' | 'filed_pending' | 'denied' | 'settlement_offered' | 'unknown';
        prior_settlement_offered?: boolean;
    };
    damages?: {
        lost_wages?: boolean;
        time_missed_from_work?: string;
        occupation?: string;
        property_damage?: boolean;
        property_damage_description?: string;
        pain_and_suffering?: string;
    };
    prior_representation?: {
        spoken_with_other_attorneys?: boolean;
        has_existing_representation?: boolean;
        prior_claims_or_lawsuits?: boolean;
    };
    scheduling_preference: {
        preferred_format: 'in_person' | 'video_call' | 'phone_call' | 'no_preference' | 'unknown';
        preferred_times?: string;
        urgency_to_consult?: 'immediate' | 'within_week' | 'within_month' | 'flexible';
        availability_notes?: string;
    };
    complexity_flags?: Array<{
        topic: string;
        reason: string;
    }>;
    session_metadata: {
        conversation_summary: string;
        statute_of_limitations_concern?: boolean;
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

export type FieldProps = { label: string; value: string; className?: string };

export type SectionProps = {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    cols?: 1 | 2;
};

export type TranscriptSectionProps = {
    transcript: Message[] | null;
    open: boolean;
    onToggle: () => void;
};

export type ActionResult = { success: true } | { success: false; error: string };