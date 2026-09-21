# Haven

A simplified discovery experience for law firms.

Haven is a full-stack, AI-native platform that accelerates client discovery through a dynamic, conversational AI session before an official consultation from an attorney. Attorneys sign up, enter their firm name, and share a unique link specific only to their firm. Once the potential client recieves the link, they will be able to answer questions tailored to their legal practice area. Once the session ends, data is extracted from the conversation and saved to the attorney's dashboard.

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

People do not want to fill out a form. They want to speak to an attorney. Haven is designed around that constraint through a short discovery session that qualifies the lead and captures the key facts before the consultation begins, without asking the client to commit to anything that feels like paperwork.

The attorney receives a structured summary in their dashboard the moment the session ends. The transcript is preserved as a backup.

Haven is positioned explicitly as a discovery assistant, not a source of legal advice. The prompts are robustly built for legal advice to never be given, no matter the circumstance.

---

## User Flow

```
Attorney signs up
        |
        v
Attorney enters their firm name which creates a firm record and claims a unique slug
        |
        v
Attorney accesses their dashboard and receives their client-facing URL: gohaven.com/live/[firm-slug]
        |
        v
Attorney sends URL to a potential client
("Please complete this before our consultation.")
        |
        v
Client opens the link without needing an account
        |
        v
Conversational AI discovery session
  - Context aware follow-ups questions based on prior answers
  - Session bounded by turn limit and duration timeout
        |
        v
Session ends
        |
        |---> Structured data extracted via tool use
        |---> Raw chat transcript saved to attorney dashboard
```

---

## Tech Stack

| Layer            | Technology                                                                         |
|------------------|------------------------------------------------------------------------------------|
| Framework        | Next.js 15 App Router, TypeScript                                                  |
| Styling          | Tailwind CSS v4, Framer Motion, shadcn/ui, Heroicons            |
| Auth             | Neon Auth (Better Auth wrapper), cookie-based, SSR-compatible                      |
| Database         | Drizzle ORM and Neon serverless PostgreSQL                                           |
| AI               | Anthropic API: Claude Sonnet (live sessions), Claude Haiku (demo)
| Validation       | Zod v4                                                                             |
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

At session end, Claude uses Anthropic's forced tool call API to convert the full conversation into structured data. The `extractChatData` function maps the transcript to a typed schema covering client identification, incident facts, injury details, and scheduling preference. Pre-chat gate fields (client name, phone, email) are overlaid deterministically after extraction rather than inferred.

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
```

`attorney_id` on `chat_sessions` is nullable. Anonymous client sessions never carry one. An attorney visiting their firm's `/live/[slug]` URL while authenticated is what sets `attorney_id` and triggers the trial flow.

Trial gating lives at the firm level, not the attorney level. `firms.trial_used` is the authoritative flag.

`db.batch()` is used for all atomic multi-table operations. Neon's `neon-http` driver does not support `db.transaction()`, so `db.batch()` is the equivalent pattern for discovery (firm + attorney insert) and session completion (status flip + trial flag).

---

## Repository Structure

```
haven/
├── __tests__/                                  # Vitest unit and integration tests
│   ├── hooks/
│   │   └── useStream.test.ts
│   └── lib/
│       ├── errors.test.ts
│       ├── firm.test.ts
│       ├── streaming.test.ts
│       └── utils.test.ts
│
├── .github/
│   └── workflows/
│       └── playwright.yml
│
├── app/                                        # Next.js App Router — routes only
│   ├── (auth)/
│   │   ├── forgot-password/
│   │   │   ├── page.tsx
│   │   │   └── actions.ts
│   │   ├── reset-password/
│   │   │   ├── page.tsx
│   │   │   └── actions.ts
│   │   ├── sign-in/
│   │   │   ├── page.tsx
│   │   │   └── actions.ts
│   │   └── sign-up/
│   │       ├── page.tsx
│   │       └── actions.ts
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...path]/
│   │   │       └── route.ts
│   │   └── chat/
│   │       ├── session/
│   │       │   └── route.ts
│   │       └── stream/
│   │           └── route.ts
│   ├── blog/
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── howitworks/
│   │   └── page.tsx
│   ├── live/
│   │   └── [slug]/
│   │       ├── page.tsx
│   │       └── loading.tsx
│   ├── onboarding/
│   │   ├── actions.ts
│   │   └── page.tsx
│   ├── globals.css
│   ├── icon.svg
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── auth/
│   │   └── SignInProviders.tsx
│   ├── dashboard/
│   │   ├── Header.tsx
│   │   ├── ClientList.tsx
│   │   ├── ClientListWrapper.tsx
│   │   └── DataPanel.tsx
│   ├── demochat/
│   │   ├── DemoChat.tsx
│   │   └── hooks/
│   │       └── useDemoSession.ts
│   ├── hooks/
│   │   ├── useStream.ts
│   │   └── useTypewriter.ts
│   ├── landing/
│   │   ├── header/
│   │   │   ├── Header.tsx
│   │   │   ├── Features.tsx
│   │   │   └── Scope.tsx
│   │   ├── DemoContainer.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   └── Summary.tsx
│   ├── livechat/
│   │   ├── LiveChat.tsx
│   │   ├── Header.tsx
│   │   ├── Expectations.tsx
│   │   └── hooks/
│   │       └── useLiveSession.ts
│   ├── onboarding/
│   │   └── Onboarding.tsx
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── field.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── loading.tsx
│       ├── providers.tsx
│       ├── separator.tsx
│       ├── sonner.tsx
│       └── themetoggle.tsx
│
├── drizzle/
│   ├── 0000_init.sql
│   └── meta/
│
├── lib/
│   ├── api/
│   │   ├── chatRecords.ts
│   │   └── chatSessions.ts
│   ├── auth/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── db/
│   │   ├── db.ts
│   │   └── schema.ts
│   ├── dashboard.ts
│   ├── errors.ts
│   ├── firm.ts
│   ├── streaming.ts
│   └── utils.ts
│
├── public/
│   └── dashboard.png
│
├── tests/                                      # Playwright E2E tests
│   ├── onboarding.spec.ts
│   └── sign-up.spec.ts
│
├── types/
│   └── types.ts
│
├── AGENTS.md
├── ARCHITECTURE.md
├── CLAUDE.md
├── components.json
├── drizzle.config.ts
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── playwright.config.ts
├── proxy.ts
├── tsconfig.json
├── vitest.config.ts
├── vitest.setup.ts
└── yarn.lock
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

**DB-level authority for slug uniqueness.** The slug `UNIQUE` constraint is the enforcing gate. The live availability check in discovery is advisory UX only. The database is always authoritative.

**server-only guards on all server modules.** `lib/db/db.ts` and other server modules import `server-only` to prevent client bundle contamination. The guard throws at build time if a server module is accidentally imported in a client component.

**AppError hierarchy for clean route handlers.** `FirmNotFoundError`, `AttorneyNotFoundError`, `TrialExhaustedError`, and `SessionNotFoundError` all extend `AppError` and map to HTTP status codes in a single lookup table in `lib/errors.ts`. Route handlers call `handleApiError(err)`. Adding a new domain error is one class and one map entry, not a change to every handler.

---

## Project Goals

This project serves three goals, listed in order of priority:

1. Portfolio: demonstrate senior-level full-stack AI engineering from LLM/API streaming, tool use, prompt caching, structured extraction, and SaaS product architecture
2. Skill development: hands-on depth in the Anthropic API, SSE streaming in Next.js, agentic tool use patterns, and serverless Postgres constraints
3. Product: a shippable MVP that dynamically adapts to any legal industry


---

## Design Principles

The client-facing UI is used by individuals who have are ultimately seeking legal help and may be anxious or stressed. Haven is built to provide a calm and reassuring experience. Every design decision flows from that context.

- Premium, minimal aesthetic
- No legal jargon in client-facing copy
- Explicit framing on every screen to let the client know that this is an assistant and does not provide legal advice

---

*Next.js 15 · TypeScript · Tailwind CSS v4 · Drizzle ORM · Neon (Postgres + Neon Auth) · Anthropic API · Vercel*