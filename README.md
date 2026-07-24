# Haven

Intelligent client triage and onboarding for law firms.

Haven is a standalone SaaS onboarding tool that triages potential clients through a conversational AI session before they ever speak with an attorney. Attorneys sign up, claim a firm slug, and share a branded link. The client answers context-aware questions tailored to their legal need. Once the session ends, structured data is extracted from the conversation and saved to the attorney's dashboard as both a polished PDF and a full chat transcript.

V1 targets personal injury firms. The long-term vision is a practice-area-agnostic triage layer that adapts dynamically to any legal vertical: personal injury, estate planning, family law, and beyond.

---

## Table of Contents

- [Overview](#overview)
- [User Flow](#user-flow)
- [Tech Stack](#tech-stack)
- [AI Architecture](#ai-architecture)
- [Data Model](#data-model)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Project Goals](#project-goals)
- [V1 Status](#v1-status)
- [V2 Roadmap](#v2-roadmap)

---

## Overview

Personal injury clients do not want to fill out a form. They want to speak to an attorney. Haven is designed around that constraint: a short triage session that qualifies the lead and captures the key facts before the consultation begins, without asking the client to commit to anything that feels like paperwork.

The attorney receives a structured summary in their dashboard the moment the session ends. The transcript is preserved as a backup. The primary deliverable is always the PDF.

Haven is positioned explicitly as an onboarding assistant, not a source of legal advice. All session framing reinforces this.

The V1 product is focused on personal injury because the triage use case fits that vertical cleanly: a few qualifying questions, a quick lead qualification, and a structured summary for the attorney. The same core workflow applies to estate planning consultations, family law inquiries, and other practice areas where attorneys spend time gathering basic facts before the real conversation begins. V2 introduces dynamic triage logic that adapts the session to the client's legal need rather than a fixed practice area.

---

## User Flow

```
Attorney signs up
        |
        v
Onboarding creates a firm record and claims a unique slug
        |
        v
Attorney receives their client-facing URL: gohaven.com/live/[firm-slug]
        |
        v
Attorney sends URL to a potential client
("Please complete this before our consultation.")
        |
        v
Client opens the link -- no account, no login required
        |
        v
Conversational AI onboarding session
  - Personal injury triage questions
  - Context-sensitive follow-ups based on prior answers
  - Session bounded by turn limit and duration timeout
        |
        v
Session ends
        |
        |---> Structured data extracted via tool use
        |---> PDF generated and stored in Vercel Blob
        |---> Attorney notified via Resend (optional)
        |---> Chat record saved to attorney dashboard
```

---

## Tech Stack

| Layer            | Technology                                                                         |
|------------------|------------------------------------------------------------------------------------|
| Framework        | Next.js 15 App Router, TypeScript                                                  |
| Styling          | Tailwind CSS v4, Framer Motion, shadcn/ui (zinc/sky palette), Heroicons            |
| Auth             | Neon Auth (Better Auth wrapper), cookie-based, SSR-compatible                      |
| Database         | Drizzle ORM + Neon serverless PostgreSQL                                           |
| AI               | Anthropic API -- Claude Sonnet (live sessions), Claude Haiku (demo), streaming + tool use |
| Validation       | Zod v4                                                                             |
| Storage          | Vercel Blob (generated PDFs)                                                       |
| PDF Generation   | pdf-lib                                                                            |
| Email Delivery   | Resend (via Next.js server-side Route Handlers)                                    |
| Notifications    | Sonner                                                                             |
| Deployment       | Vercel (single Next.js monorepo, no separate backend)                              |
| Package Manager  | yarn                                                                               |

---

## AI Architecture

### Hybrid Model Strategy

Haven uses two Claude models with distinct roles. The landing page hosts a sandboxed demo chat that runs on Haiku for cost efficiency. Live client sessions use Sonnet because quality directly affects attorney trust in the product. The streaming route branches on `isDemo`. Both branches share the same SSE encoding layer and the same client-side parser. The client never knows which model served it.

| Context        | Model          | Rationale                                                    |
|----------------|----------------|--------------------------------------------------------------|
| Demo (landing) | Claude Haiku   | Cost efficiency: anonymous, turn-limited, no DB backing      |
| Live sessions  | Claude Sonnet  | Quality matters: real clients, real attorneys, real output   |

### Streaming Architecture

Responses stream token-by-token via Server-Sent Events. `useStream.ts` is the single client-side SSE consumer for both demo and live paths. It handles fetch, decode, parse, abort, and timeout. Neither `useDemoSession` nor `useLiveSession` touches raw SSE directly.

```
Client (useStream.ts)                     Server (api/chat/stream/route.ts)
        |                                           |
        |  --- POST { message, sessionId } --->     |
        |                                     branch on isDemo
        |                              Anthropic streaming API
        |                                           |
        |  <--- SSE chunks (text deltas) -----------|
        |                                           |
   parse chunk                               on message_stop:
  (lib/streaming.ts)                     incrementTurn() + completeSession()
        |
   update message state
   (useLiveSession / useDemoSession)
```

### Structured Extraction via Tool Use

At session end, Claude uses Anthropic's forced tool call API to convert the full conversation into structured data. The `extractChatData` function maps the transcript to a typed schema covering client identification, incident facts, injury details, and scheduling preference. Pre-chat gate fields (client name, phone, email) are overlaid deterministically after extraction rather than inferred. The extracted payload is the source of truth for PDF generation -- the transcript is not re-parsed.

### Prompt Caching

Both streaming branches apply `cache_control: { type: 'ephemeral' }` on the system block. Haiku requires 2,048+ tokens to activate prompt caching; Sonnet requires 1,024+. The demo prompt falls below Haiku's threshold, so the caching investment pays off exclusively on the live session route where the system prompt is large and repeated across every turn of a session.

### Session Bounds

Live sessions are bounded by hard limits enforced server-side:

- `MAX_LIVE_TURNS = 30`: turn count checked on each message, HTTP 410 on limit hit
- `MAX_SESSION_DURATION_MS = 45 min`: wall-clock duration checked at session fetch

Both limits return 410 Gone. `useLiveSession` maps this to a terminal `complete` state in the UI.

---

## Data Model

```
firms
  id · name · slug (UNIQUE) · trial_used · has_active_subscription · created_at

attorneys
  id · firm_id (FK -> firms) · user_id (FK -> Neon Auth users) · created_at

chat_sessions
  id · firm_id (FK -> firms) · attorney_id (nullable FK -> attorneys)
  status · turn_count · started_at · completed_at

chat_records
  id · session_id (FK -> chat_sessions) · structured_data (JSONB)
  pdf_url · status ('new' | 'reviewed') · created_at
```

`attorney_id` on `chat_sessions` is nullable. Anonymous client sessions never carry one. An attorney visiting their firm's `/live/[slug]` URL while authenticated is what sets `attorney_id` and triggers the trial flow.

Trial gating lives at the firm level, not the attorney level. `firms.trial_used` is the authoritative flag.

`db.batch()` is used for all atomic multi-table operations. Neon's `neon-http` driver does not support `db.transaction()`, so `db.batch()` is the equivalent pattern for onboarding (firm + attorney insert) and session completion (status flip + trial flag).

---

## Repository Structure

```
app/                        # Next.js App Router -- routes only, no business logic
  (auth)/                   # Login and sign-up, each with a colocated actions.ts
  onboarding/               # Create firm, claim slug, debounced live availability check
  dashboard/                # Attorney dashboard, auth-gated master-detail layout
  live/[slug]/              # Client-facing onboarding session, no auth required
  api/
    auth/[...path]/         # Neon Auth catch-all handler
    chat/
      session/              # POST create, GET fetch, PATCH complete
      stream/               # SSE proxy to Anthropic -- isDemo branch + live branch

components/
  auth/                     # OAuth sign-in buttons
  dashboard/                # Header, ClientList, ClientListWrapper, DataPanel
  demochat/                 # Sandboxed landing-page demo + useDemoSession hook
  hooks/                    # Shared primitives: useStream, useSmoothChat
  landing/                  # Marketing page sections
  livechat/                 # LiveChat orchestrator + useLiveSession hook
  ui/                       # shadcn/ui primitives and Haven overrides

lib/
  api/
    chatSessions.ts         # createSession, getSession, incrementTurn, completeSession
    chatRecords.ts          # buildCreateChatRecordQuery, getChatRecordBySessionId
    extraction.ts           # extractChatData -- forced tool call to Anthropic
  auth/
    server.ts               # createNeonAuth()
    client.ts               # createAuthClient() -- use client
  db/
    db.ts                   # Drizzle instance, server-only guarded
    schema.ts               # firms, attorneys, chat_sessions, chat_records
  dashboard.ts              # getFirmIdForUser, getChatRecords, updateRecordStatus
  errors.ts                 # AppError subclasses + handleApiError() status-code mapping
  firm.ts                   # slugify, isFirmNameAvailable, getFirmIdBySlug
  streaming.ts              # SSE parsing: parseSSELine, getTextDelta, isMessageStop
  utils.ts                  # cn(), capitalizeName(), shared helpers

types/
  types.ts                  # SessionStatus, Message, ChatSession, StreamOptions
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- yarn
- A Neon database (Postgres + Neon Auth)
- An Anthropic API key
- A Vercel project (for Blob storage)
- A Resend account (for email delivery, optional in development)

### Setup

```bash
git clone https://github.com/numenor-dev/haven
cd haven
yarn install
cp .env.example .env.local
```

Fill in `.env.local`:

```
# Neon
DATABASE_URL=
DATABASE_URL_UNPOOLED=

# Neon Auth
NEXT_PUBLIC_STACK_PROJECT_ID=
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=
STACK_SECRET_SERVER_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Vercel Blob
BLOB_READ_WRITE_TOKEN=

# Resend (optional in dev)
RESEND_API_KEY=
RESEND_FROM_ADDRESS=
```

Run migrations and start the dev server:

```bash
yarn drizzle-kit push
yarn dev
```

### Demo Mode

The landing page at `/` runs an embedded demo chat using Claude Haiku. No database or session is required. This route is always available in development without additional setup beyond `ANTHROPIC_API_KEY`.

---

## Key Architectural Decisions

**Hook location communicates scope.** `useStream.ts` lives in `components/hooks/` because both `useLiveSession` and `useDemoSession` consume it. Feature-specific hooks live colocated with their feature. A hook lives at the lowest common ancestor of everything that consumes it.

**Async interfaces from day one.** All session store functions were typed `async` before the database was wired. When `lib/api/chatSessions.ts` migrated from in-memory state to Drizzle, zero changes were required in the route handlers. The interface contract was stable; the implementation swapped underneath it.

**URL state over useState for dashboard selection.** `/dashboard?chat=id` over client state for the selected session. This enables shareable links, browser back/forward, and eliminates hydration complexity. The server component reads `searchParams` and passes the selected ID down.

**DB-level authority for slug uniqueness.** The slug `UNIQUE` constraint is the enforcing gate. The live availability check in onboarding is advisory UX only. The database is always authoritative.

**server-only guards on all server modules.** `lib/db/db.ts` and other server modules import `server-only` to prevent client bundle contamination. The guard throws at build time if a server module is accidentally imported in a client component.

**AppError hierarchy for clean route handlers.** `FirmNotFoundError`, `AttorneyNotFoundError`, `TrialExhaustedError`, and `SessionNotFoundError` all extend `AppError` and map to HTTP status codes in a single lookup table in `lib/errors.ts`. Route handlers call `handleApiError(err)`. Adding a new domain error is one class and one map entry, not a change to every handler.

---

## Project Goals

This project serves three goals, listed in order of priority:

1. Portfolio: demonstrate senior-level full-stack AI engineering -- streaming, tool use, prompt caching, structured extraction, and SaaS product architecture
2. Skill development: hands-on depth in the Anthropic API, SSE streaming in Next.js, agentic tool use patterns, and serverless Postgres constraints
3. Product: a shippable MVP targeting personal injury firms, with a clear path to a multi-vertical triage platform in V2

The competitive moat is designed to come from proprietary domain knowledge built through real attorney relationships, not from code secrecy. The repository is public.

---

## V1 Status

Built and working:

- Auth flow: sign-up, login, OAuth (Google/GitHub)
- Onboarding: firm creation, slug claiming with live availability check, atomic firm + attorney insert
- Full streaming pipeline: `LiveChat`, `useLiveSession`, `useStream`, `lib/streaming.ts`, `api/chat/stream`
- Demo chat: sandboxed landing-page session with `useDemoSession`, no database backing
- Session management: create, fetch, increment turn, complete
- Structured data extraction: `extractChatData` via forced tool call
- Dashboard: `ClientList`, `DataPanel`, URL-based selection, status updates with optimistic UI
- Trial gating: firm-level, `TrialExhaustedError`
- Error hierarchy: `AppError` subclasses with `handleApiError()`

In progress or pending for V1 completion:

- Wire `getFirmIdBySlug` into `/live/[slug]` (currently validated against a hardcoded test array)
- PDF generation via pdf-lib, stored to Vercel Blob
- Structured extraction wired to `completeSession()` trigger
- Email delivery via Resend on session completion
- Swap placeholder prompt content to final personal injury prompt
- Diverge `livePrompt` from `demoPrompt`
- Complete `DataPanel` (transcript viewer, structured data display, PDF inline render)

---

## V2 Roadmap

The headline V2 investment is intelligent multi-vertical triage. Rather than a fixed personal injury session, Haven dynamically adapts to the client's legal need based on firm configuration and session context. The attorney configures which practice areas their firm handles during onboarding. The AI uses that context to shape the conversation from the first message.

This changes the extraction schema, the PDF template, and the prompt architecture. Each practice area has a distinct set of qualifying questions and structured output fields. The core streaming pipeline, session management, and dashboard remain unchanged.

---

## Design Principles

The client-facing interface is used by individuals who have recently been injured and are seeking legal help. The UI must project calm, clarity, and competence. Every design decision flows from that context.

- Premium, minimal aesthetic: no playful patterns, no chatbot branding
- No legal jargon in client-facing copy
- Explicit onboarding framing on every screen: this is an assistant, not legal advice
- The PDF is the hero artifact. The transcript is the safety net.

---

*Next.js 15 · TypeScript · Tailwind CSS v4 · Drizzle ORM · Neon (Postgres + Neon Auth) · Anthropic API · Vercel*