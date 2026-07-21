import Anthropic from '@anthropic-ai/sdk';
import type { Message, StructuredData } from '@/types/types';

const anthropic = new Anthropic();

export const extractionTool: Anthropic.Tool = {
    name: 'extract_chat_session_data',
    description:
        'Extract structured chat data from a completed estate planning consultation. ' +
        'Omit optional fields entirely if the topic was not discussed.',
    input_schema: {
        type: 'object' as const,
        required: ['client_identification', 'scheduling_preference', 'session_metadata'],
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
            family_situation: {
                type: 'object',
                properties: {
                    marital_status: {
                        type: 'string',
                        enum: ['single', 'married', 'divorced', 'widowed', 'domestic_partnership', 'unknown'],
                    },
                    has_children: { type: 'boolean' },
                    number_of_children: { type: 'number' },
                    has_dependents: { type: 'boolean' },
                    dependent_notes: { type: 'string' },
                },
            },
            assets_overview: {
                type: 'object',
                properties: {
                    has_real_estate: { type: 'boolean' },
                    has_business_interests: { type: 'boolean' },
                    has_retirement_accounts: { type: 'boolean' },
                    has_life_insurance: { type: 'boolean' },
                    estimated_estate_size: {
                        type: 'string',
                        enum: ['under_500k', '500k_to_1m', '1m_to_5m', 'over_5m', 'unknown'],
                    },
                    asset_notes: { type: 'string' },
                },
            },
            existing_documents: {
                type: 'object',
                properties: {
                    has_existing_will: { type: 'boolean' },
                    has_trust: { type: 'boolean' },
                    has_power_of_attorney: { type: 'boolean' },
                    has_healthcare_directive: { type: 'boolean' },
                    documents_notes: { type: 'string' },
                },
            },
            planning_goals: {
                type: 'object',
                properties: {
                    avoid_probate: { type: 'boolean' },
                    minimize_taxes: { type: 'boolean' },
                    charitable_giving: { type: 'boolean' },
                    business_succession: { type: 'boolean' },
                    goals_notes: { type: 'string' },
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
            session_metadata: {
                type: 'object',
                required: ['conversation_summary'],
                properties: {
                    conversation_summary: { type: 'string' },
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
                'You are extracting structured data from a completed estate planning onboarding conversation. ' +
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