'use client';

import { useState } from 'react';
import {
    DocumentArrowDownIcon,
    ExclamationTriangleIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    FolderOpenIcon,
    UserCircleIcon,
    MapPinIcon,
    HeartIcon,
    ClipboardDocumentListIcon,
    ScaleIcon,
    ShieldCheckIcon,
    BanknotesIcon,
    CalendarDaysIcon,
    DocumentTextIcon,
    ClockIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { cn, formatTitle, formatDate, formatExpenses, yesNo } from '@/lib/utils';
import {
    ChatRecordsStatus,
    DataPanelProps,
    Message,
    FieldProps,
    SectionProps,
    StructuredData,
    TranscriptSectionProps
} from '@/types/types';

function Field({ label, value, className }: FieldProps) {
    return (
        <div className={cn('space-y-0.5', className)}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                {label}
            </p>
            <p className="text-sm leading-snug text-zinc-800 dark:text-zinc-200">
                {value || '—'}
            </p>
        </div>
    );
}

function Section({ title, icon: Icon, children, cols = 2 }: SectionProps) {
    return (
        <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
                <h3 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                    {title}
                </h3>
            </div>
            <div className={cn('grid gap-x-6 gap-y-4', cols === 2 ? 'grid-cols-2' : 'grid-cols-1')}>
                {children}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: ChatRecordsStatus }) {
    const isNew = status === 'new';
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                isNew
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
            )}
        >
            {!isNew && <CheckCircleIcon className="h-3 w-3" />}
            {formatTitle(status)}
        </span>
    );
}

function EmptyState({ userName }: { userName: string | null }) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-zinc-50 px-8 text-center dark:bg-zinc-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <FolderOpenIcon className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
            </div>
            {userName && (
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Welcome, {userName}
                </p>
            )}
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
                Select a client to view their onboarding record.
            </p>
        </div>
    );
}


function TranscriptSection({ transcript, open, onToggle }: TranscriptSectionProps) {
    if (!transcript?.length) return null;

    return (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
                <div className="flex items-center gap-2">
                    <DocumentTextIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                        Full Transcript
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        ({transcript.length} messages)
                    </span>
                </div>
                {open
                    ? <ChevronUpIcon className="h-4 w-4 text-zinc-400" />
                    : <ChevronDownIcon className="h-4 w-4 text-zinc-400" />
                }
            </button>

            {open && (
                <div className="max-h-120 space-y-4 overflow-y-auto border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
                    {transcript.map((msg, i) => (
                        <div
                            key={i}
                            className={cn(
                                'flex gap-2.5',
                                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row',
                            )}
                        >
                            {/* Avatar */}
                            <div
                                className={cn(
                                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                                    msg.role === 'user'
                                        ? 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
                                        : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900',
                                )}
                            >
                                {msg.role === 'user' ? 'C' : 'H'}
                            </div>

                            {/* Bubble */}
                            <div
                                className={cn(
                                    'max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed',
                                    msg.role === 'user'
                                        ? 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'
                                        : 'border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300',
                                )}
                            >
                                {typeof msg.content === 'string'
                                    ? msg.content
                                    : JSON.stringify(msg.content)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function DataPanel({ record, userName }: DataPanelProps) {
    const [transcriptOpen, setTranscriptOpen] = useState(false);

    // No selection
    if (!record) return <EmptyState userName={userName} />;

    const structured = record.structuredData as StructuredData;

    // Record exists but extraction hasn't completed yet
    if (!structured) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-zinc-50 px-8 text-center dark:bg-zinc-950">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Onboarding data is still processing.</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">This may take a moment.</p>
            </div>
        );
    }

    const {
        client_identification,
        incident_details,
        injuries,
        medical_treatment,
        liability,
        insurance_information,
        damages,
        prior_representation,
        scheduling_preference,
        complexity_flags,
        session_metadata,
    } = structured;

    const hasSoL   = session_metadata.statute_of_limitations_concern;
    const hasFlags = complexity_flags && complexity_flags.length > 0;

    return (
        <div className="flex h-full flex-col overflow-y-auto bg-zinc-50 dark:bg-zinc-950">

            <div className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50/95 px-6 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 supports-backdrop-filter:bg-zinc-50/80 dark:supports-backdrop-filter:bg-zinc-950/80">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-0.5">
                        <h2 className="truncate text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                            {record.clientName ?? client_identification.full_name}
                        </h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Completed {formatDate(record.completedAt ?? record.createdAt)}
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                        <StatusBadge status={record.status} />

                        {/* TODO: wire to server action in app/dashboard/actions.ts
                            updateChatRecordsStatus(record.id, firmId, 'reviewed')
                            then router.refresh() to re-run the server component fetch */}

                        {record.pdfUrl ? (
                            <a
                                href={record.pdfUrl}
                                download
                                className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                            >
                                <DocumentArrowDownIcon className="h-4 w-4" />
                                Download PDF
                            </a>
                        ) : (
                            <span className="text-xs italic text-zinc-400 dark:text-zinc-500">
                                PDF pending
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4 p-6">

                {/* Statute of limitations alert */}
                {hasSoL && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3.5 dark:border-amber-700 dark:bg-amber-950/40">
                        <ClockIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                        <div>
                            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                                Statute of Limitations Concern
                            </p>
                            <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-400">
                                This client may be approaching their filing deadline. Review this record promptly.
                            </p>
                        </div>
                    </div>
                )}

                {/* Case summary and complexity flags */}
                <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                    <h3 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                        Case Summary
                    </h3>
                    <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                        {session_metadata.conversation_summary}
                    </p>

                    {hasFlags && (
                        <div className="space-y-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                            {complexity_flags!.map((flag, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400" />
                                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                            {flag.topic}
                                        </span>
                                        {' — '}
                                        {flag.reason}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main data grid */}
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">

                    <Section title="Incident" icon={MapPinIcon}>
                        <Field label="Type"                 value={formatTitle(incident_details.incident_type)} />
                        <Field label="Date"                 value={formatDate(incident_details.incident_date)} />
                        <Field label="Location"             value={incident_details.incident_location ?? '—'} />
                        <Field label="Police report filed"  value={yesNo(incident_details.police_report_filed)} />
                        <Field label="Witnesses present"    value={yesNo(incident_details.witnesses_present)} />
                        <Field label="Evidence / photos"    value={yesNo(incident_details.photos_or_evidence)} />
                        {incident_details.incident_description && (
                            <Field
                                label="Description"
                                value={incident_details.incident_description}
                                className="col-span-2"
                            />
                        )}
                    </Section>

                    <Section title="Injuries" icon={HeartIcon}>
                        <Field label="Medical status"   value={formatTitle(injuries.current_medical_status)} />
                        <Field label="Hospitalized"     value={yesNo(injuries.hospitalized)} />
                        <Field label="Surgery required" value={yesNo(injuries.surgeries_required)} />
                        {injuries.injury_types?.length ? (
                            <Field
                                label="Injury types"
                                value={injuries.injury_types.map((t) => formatTitle(String(t))).join(', ')}
                                className="col-span-2"
                            />
                        ) : null}
                        {injuries.injury_description && (
                            <Field
                                label="Description"
                                value={injuries.injury_description}
                                className="col-span-2"
                            />
                        )}
                    </Section>

                    {medical_treatment && (
                        <Section title="Medical Treatment" icon={ClipboardDocumentListIcon}>
                            <Field label="Ongoing treatment"    value={yesNo(medical_treatment.ongoing_treatment)} />
                            <Field label="Est. medical expenses" value={formatExpenses(medical_treatment.estimated_medical_expenses)} />
                            {medical_treatment.providers_seen && (
                                <Field label="Providers" value={medical_treatment.providers_seen} className="col-span-2" />
                            )}
                            {medical_treatment.treatment_notes && (
                                <Field label="Notes" value={medical_treatment.treatment_notes} className="col-span-2" />
                            )}
                        </Section>
                    )}

                    {liability && (
                        <Section title="Liability" icon={ScaleIcon}>
                            <Field label="At-fault party"      value={liability.at_fault_party ?? '—'} />
                            <Field label="Client fault"        value={formatTitle(liability.client_fault)} />
                            <Field label="Multiple defendants" value={yesNo(liability.multiple_defendants)} />
                        </Section>
                    )}

                    {insurance_information && (
                        <Section title="Insurance" icon={ShieldCheckIcon}>
                            <Field label="Client insured"           value={yesNo(insurance_information.client_has_insurance)} />
                            <Field label="Opposing party insured"   value={yesNo(insurance_information.at_fault_party_insured)} />
                            <Field label="Claim filed"              value={yesNo(insurance_information.claim_filed)} />
                            <Field label="Claim status"             value={formatTitle(insurance_information.claim_status)} />
                            <Field label="Prior settlement offered" value={yesNo(insurance_information.prior_settlement_offered)} />
                        </Section>
                    )}

                    {damages && (
                        <Section title="Damages" icon={BanknotesIcon}>
                            <Field label="Lost wages"      value={yesNo(damages.lost_wages)} />
                            <Field label="Property damage" value={yesNo(damages.property_damage)} />

                            {damages.lost_wages === true && (
                                <>
                                    <Field label="Time missed from work" value={damages.time_missed_from_work ?? '—'} />
                                    <Field label="Occupation"            value={damages.occupation ?? '—'} />
                                </>
                            )}
                            {damages.property_damage && damages.property_damage_description && (
                                <Field
                                    label="Property damage details"
                                    value={damages.property_damage_description}
                                    className="col-span-2"
                                />
                            )}
                            {damages.pain_and_suffering && (
                                <Field
                                    label="Pain & suffering"
                                    value={damages.pain_and_suffering}
                                    className="col-span-2"
                                />
                            )}
                        </Section>
                    )}
                </div>

                {/* Contact and scheduling — always rendered, always side-by-side on xl */}
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <Section title="Client Contact" icon={UserCircleIcon}>
                        <Field label="Name"  value={client_identification.full_name} />
                        <Field label="Phone" value={client_identification.phone ?? '—'} />
                        <Field label="Email" value={client_identification.email ?? '—'} />
                    </Section>

                    <Section title="Scheduling Preference" icon={CalendarDaysIcon}>
                        <Field label="Format"  value={formatTitle(scheduling_preference.preferred_format)} />
                        <Field label="Urgency" value={formatTitle(scheduling_preference.urgency_to_consult)} />
                        {scheduling_preference.preferred_times && (
                            <Field label="Preferred times" value={scheduling_preference.preferred_times} className="col-span-2" />
                        )}
                        {scheduling_preference.availability_notes && (
                            <Field label="Availability notes" value={scheduling_preference.availability_notes} className="col-span-2" />
                        )}
                    </Section>
                </div>

                {/* Prior representation */}
                {prior_representation && (
                    <Section title="Prior Representation" icon={DocumentTextIcon}>
                        <Field label="Spoken with other attorneys"  value={yesNo(prior_representation.spoken_with_other_attorneys)} />
                        <Field label="Has existing representation"  value={yesNo(prior_representation.has_existing_representation)} />
                        <Field label="Prior claims or lawsuits"     value={yesNo(prior_representation.prior_claims_or_lawsuits)} />
                    </Section>
                )}

                {/* Additional notes */}
                {session_metadata.additional_notes && (
                    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                            Additional Notes
                        </h3>
                        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                            {session_metadata.additional_notes}
                        </p>
                    </div>
                )}

                <TranscriptSection
                    transcript={record.transcript as Message[] | null}
                    open={transcriptOpen}
                    onToggle={() => setTranscriptOpen((v) => !v)}
                />
            </div>
        </div>
    );
}