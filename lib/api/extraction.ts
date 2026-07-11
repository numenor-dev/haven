import Anthropic from '@anthropic-ai/sdk';
import type { StructuredData } from '@/types/types';
import type { Message } from '@/types/types';

const anthropic = new Anthropic();

const extractionTool: Anthropic.Tool = {
    name: 'extract_chat_session_data',
    description:
        'Extract structured chat data from a completed personal injury consultation transcript. ' +
        'Omit optional fields entirely if the topic was not discussed — do not guess or fill with unknowns.',
    input_schema: {
        type: 'object' as const,
        required: [
            'client_identification',
            'incident_details',
            'injuries',
            'scheduling_preference',
            'session_metadata',
        ],
        properties: {
            client_identification: {
                type: 'object',
                required: ['full_name'],
                properties: {
                    full_name: { type: 'string' },
                    phone: { type: 'string' },
                    email: { type: 'string' },
                },
            },
            incident_details: {
                type: 'object',
                required: ['incident_type', 'incident_description'],
                properties: {
                    incident_type: {
                        type: 'string',
                        enum: [
                            'motor_vehicle_accident', 'slip_and_fall', 'medical_malpractice',
                            'workplace_injury', 'product_liability', 'premises_liability',
                            'wrongful_death', 'other',
                        ],
                    },
                    incident_description: { type: 'string' },
                    incident_date: { type: 'string' },
                    incident_location: { type: 'string' },
                    police_report_filed: { type: 'boolean' },
                    witnesses_present: { type: 'boolean' },
                    photos_or_evidence: { type: 'boolean' },
                },
            },
            injuries: {
                type: 'object',
                required: ['injury_description'],
                properties: {
                    injury_description: { type: 'string' },
                    injury_types: {
                        type: 'array',
                        items: {
                            type: 'string',
                            enum: [
                                'soft_tissue', 'broken_bones', 'traumatic_brain_injury',
                                'spinal_injury', 'burns', 'lacerations',
                                'internal_injuries', 'psychological', 'other',
                            ],
                        },
                    },
                    current_medical_status: {
                        type: 'string',
                        enum: ['ongoing_treatment', 'recovered', 'recovering', 'permanent_disability', 'unknown'],
                    },
                    surgeries_required: { type: 'boolean' },
                    hospitalized: { type: 'boolean' },
                },
            },
            medical_treatment: {
                type: 'object',
                properties: {
                    providers_seen: { type: 'string' },
                    estimated_medical_expenses: {
                        type: 'string',
                        enum: ['under_10k', '10k_to_50k', '50k_to_100k', 'over_100k', 'unknown'],
                    },
                    ongoing_treatment: { type: 'boolean' },
                    treatment_notes: { type: 'string' },
                },
            },
            liability: {
                type: 'object',
                properties: {
                    at_fault_party: { type: 'string' },
                    client_fault: {
                        type: 'string',
                        enum: ['none', 'minimal', 'partial', 'unknown'],
                    },
                    multiple_defendants: { type: 'boolean' },
                },
            },
            insurance_information: {
                type: 'object',
                properties: {
                    client_has_insurance: { type: 'boolean' },
                    at_fault_party_insured: { type: 'boolean' },
                    claim_filed: { type: 'boolean' },
                    claim_status: {
                        type: 'string',
                        enum: ['not_filed', 'filed_pending', 'denied', 'settlement_offered', 'unknown'],
                    },
                    prior_settlement_offered: { type: 'boolean' },
                },
            },
            damages: {
                type: 'object',
                properties: {
                    lost_wages: { type: 'boolean' },
                    time_missed_from_work: { type: 'string' },
                    occupation: { type: 'string' },
                    property_damage: { type: 'boolean' },
                    property_damage_description: { type: 'string' },
                    pain_and_suffering: { type: 'string' },
                },
            },
            prior_representation: {
                type: 'object',
                properties: {
                    spoken_with_other_attorneys: { type: 'boolean' },
                    has_existing_representation: { type: 'boolean' },
                    prior_claims_or_lawsuits: { type: 'boolean' },
                },
            },
            scheduling_preference: {
                type: 'object',
                required: ['preferred_format'],
                properties: {
                    preferred_format: {
                        type: 'string',
                        enum: ['in_person', 'video_call', 'phone_call', 'no_preference', 'unknown'],
                    },
                    preferred_times: { type: 'string' },
                    urgency_to_consult: {
                        type: 'string',
                        enum: ['immediate', 'within_week', 'within_month', 'flexible'],
                    },
                    availability_notes: { type: 'string' },
                },
            },
            complexity_flags: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['topic', 'reason'],
                    properties: {
                        topic: { type: 'string' },
                        reason: { type: 'string' },
                    },
                },
            },
            session_metadata: {
                type: 'object',
                required: ['conversation_summary'],
                properties: {
                    conversation_summary: { type: 'string' },
                    statute_of_limitations_concern: { type: 'boolean' },
                    additional_notes: { type: 'string' },
                },
            },
        },
    },
};

export async function extractChatData(
    transcript: Message[],
    clientInfo: { clientName: string; clientPhone?: string; clientEmail?: string }
): Promise<StructuredData | null> {
    try {
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 4096,
            tool_choice: { type: 'tool', name: 'extract_chat_session_data' },
            tools: [extractionTool],
            system:
                'You are extracting structured data from a completed personal injury onboarding conversation. ' +
                'Be accurate, conservative, and only extract what was explicitly stated. ' +
                'Do not infer, assume, or fill optional fields with placeholder values.',

            messages: [
                ...transcript.map(({ role, content }) => ({ role, content })),
                { role: 'user' as const, content: 'Extract the structured chat data from this conversation.' }
            ]
        });

        const toolBlock = response.content.find((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');
        if (!toolBlock) {
            console.error('[extractChatData] No tool_use block in response');
            return null;
        }

        const extracted = toolBlock.input as StructuredData;

        return {
            ...extracted,
            client_identification: {
                full_name: clientInfo.clientName,
                phone: clientInfo.clientPhone,
                email: clientInfo.clientEmail,
            },
        };
    } catch (err) {
        console.error('[extractChatData] Claude API error:', err);
        return null;
    }
}