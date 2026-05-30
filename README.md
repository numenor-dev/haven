# Haven — An Intelligent Client Intake Workflow for Attorneys

> Conversational AI intake sessions that end in a structured PDF on your desk — before the consultation begins.

![Status](https://img.shields.io/badge/status-in_development-yellow)
![Stack](https://img.shields.io/badge/stack-Next.js_%2F_Node.js_%2F_pgvector-blue)
![AI](https://img.shields.io/badge/AI-Claude_(Anthropic)-blueviolet)
![License](https://img.shields.io/badge/license-private-lightgrey)

---

## Overview

Haven is a standalone SaaS intake tool built for estate planning attorneys. Rather than phone tag or generic intake forms, attorneys send clients a branded link. The client completes a conversational AI session — estate planning questions with jurisdiction-aware follow-ups — and the result is a structured PDF automatically emailed to the attorney and stored in their dashboard.

This project is simultaneously a portfolio demonstration of senior-level AI engineering and an MVP toward a real product sold to small estate planning firms.

**What makes it different from a form:**
- The AI asks context-sensitive follow-up questions based on prior answers (e.g., if a client mentions minor children, it probes guardianship and trust preferences)
- RAG retrieval pulls jurisdiction-specific legal context to shape question logic
- Scheduling preferences are captured conversationally and surfaced as a first-class field in the dashboard — not buried in a transcript

---

## Key Features

### For Attorneys
- Unique branded intake URL per firm: `yourtool.com/intake/[firm-slug]`
- Dashboard with client intake history, status tracking, and one-click PDF download
- Scheduling preference surfaced at the list level — no need to open the PDF to know availability
- Collapsible full chat transcript available as a backup record

### For Clients
- Calm, premium conversational interface — appropriate for high-net-worth individuals
- No account creation, no form friction — just a link and a conversation
- Clear framing as an intake assistant, not legal advice

### Core AI Behavior
- Jurisdiction-aware question logic via RAG (pgvector + PostgreSQL)
- Context-sensitive follow-ups throughout the session using agentic tool use
- Response streaming for a natural, real-time conversational feel
- Structured output extraction to populate the PDF with clean, organized data

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Node.js, PostgreSQL + pgvector |
| AI | Anthropic API (Claude), streaming, agentic tool use |
| RAG | pgvector semantic search over estate planning / jurisdiction content |
| PDF Generation | pdf-lib |
| Email Delivery | Resend (SMTP) |
| Auth | TBD — JWT or NextAuth |

---

## Repository Structure

This project uses a split-repo strategy appropriate for a public portfolio case study:

| Repo | Visibility | Contents |
|---|---|---|
| `haven-frontend` | **Public** | Next.js app, intake UI, dashboard, component library |
| `haven-backend` | **Private** | Node.js API, RAG pipeline, PDF generation, email, DB schema |

The public frontend repo is the portfolio artifact. The private backend repo contains proprietary prompt logic, RAG retrieval architecture, and business logic.

---

## Project Goals

This project serves three explicit goals, listed in priority order:

1. **Portfolio** — Demonstrate senior-level AI engineering: RAG pipelines, streaming, agentic tool use, prompt engineering, and full-stack product architecture
2. **Skill-building** — Hands-on reps with vector databases, pgvector, response streaming, and Anthropic's tool use API
3. **MVP** — A shippable V1 targeting local estate planning firms, with a clear V2 roadmap

---

## User Flow

```
Attorney signs up
      │
      ▼
Receives unique intake URL: yourtool.com/intake/[firm-slug]
      │
      ▼
Sends URL to potential client ("please complete before our consultation")
      │
      ▼
Client opens link — no login, no friction
      │
      ▼
Conversational AI intake session
  - Estate planning questions
  - Jurisdiction-aware follow-ups via RAG
  - Scheduling preference capture
      │
      ▼
Session ends → structured PDF generated
      │
      ├──► PDF emailed to attorney automatically
      │
      └──► Intake stored in attorney dashboard
```

---

## Attorney Dashboard

The dashboard is designed around how attorneys actually process incoming clients — quickly and in bulk.

**List view columns:**
- Client name + intake date (primary identifiers)
- Status badge: `New` / `Reviewed` / `Consultation Scheduled`
- Scheduling preference (highlighted inline — actionable without opening anything)
- PDF download button (primary CTA)

**Per-entry detail:**
- Collapsible full chat transcript — available but visually subordinate to the PDF

Design principle: **the PDF is the hero artifact, the transcript is the safety net.**

---

## AI Architecture

### RAG Pipeline

Estate planning law varies significantly by jurisdiction. The RAG layer retrieves relevant statutory context, common planning patterns, and jurisdiction-specific considerations to shape question logic at each step of the intake.

```
Client message
      │
      ▼
Embed with Anthropic (or OpenAI ada-002)
      │
      ▼
pgvector similarity search
  - Jurisdiction-specific statutes
  - Common estate planning patterns
  - Prior session context (within session only)
      │
      ▼
Retrieved context injected into Claude prompt
      │
      ▼
Claude generates next question or follow-up
```

### Agentic Tool Use

Claude uses Anthropic's tool use API to:
- `get_jurisdiction_context(state)` — retrieves relevant legal context for the client's state
- `flag_complexity(topic)` — marks issues that may require extended consultation time
- `extract_structured_data()` — at session end, converts conversation to structured PDF schema

### Streaming

Responses stream token-by-token using the Anthropic streaming API, giving the intake session a natural conversational feel rather than a loading spinner between questions.

### Prompt Constraints

All prompts include explicit framing:
- Claude is positioned as an **intake assistant**, not a legal advisor
- No legal conclusions are drawn from client answers
- Output is structured for attorney review, not client-facing interpretation

---

## PDF Output Schema

Each completed intake produces a PDF structured as:

```
1. Client Identification
   - Name, contact, jurisdiction

2. Family & Dependents
   - Spouse/partner status
   - Minor children (names, ages, guardianship preferences)
   - Dependents with special needs

3. Assets Overview
   - Real property
   - Financial accounts
   - Business interests
   - Beneficiary designations in place

4. Planning Goals
   - Primary objectives (asset protection, Medicaid planning, charitable giving, etc.)
   - Existing documents (will, trust, POA, healthcare directive)

5. Scheduling Preference
   - Availability windows captured during session

6. Session Metadata
   - Date, duration, intake URL slug, AI model version
```

---

## V1 Scope

- Standalone SaaS — attorneys share the intake URL directly, similar to Calendly
- Estate planning practice area only
- Single PDF template
- Email delivery via Resend
- Dashboard with status tracking and PDF download

---

## V2 Roadmap

| Feature | Notes |
|---|---|
| iFrame / Web Component embed | Premium tier — attorneys embed on their own site |
| Calendar integration | Trigger invite directly from scheduling preference capture |
| Clio API integration | Dominant case management platform in small firms |
| Additional practice areas | Expand RAG corpus and question trees beyond estate planning |
| Multi-attorney firm support | Role-based access, shared dashboard |

---

## Design Philosophy

**Audience:** High-net-worth individuals completing a legal intake. The UI must project calm, competence, and trust — not a chatbot.

**Principles:**
- Premium, minimal aesthetic — no playful UI patterns
- No legal jargon in the client-facing interface
- Explicit intake framing on every screen ("This is an intake assistant, not legal advice")
- PDF is the deliverable — design decisions flow backward from it

---

## Portfolio Context

This project is documented as a case study on [portfolio site — link TBD], covering:

- RAG pipeline design decisions (chunking strategy, embedding model selection, retrieval scoring)
- Prompt engineering for structured output extraction from unstructured conversation
- Streaming architecture in Next.js with the Anthropic API
- Split-repo strategy for open-source portfolio presentation with IP protection
- Product decisions: why estate planning as the V1 wedge, why PDF-first

---

## Getting Started (Frontend)

```bash
git clone https://github.com/[username]/haven-frontend
cd haven-frontend
npm install
cp .env.example .env.local
# Add NEXT_PUBLIC_API_URL pointing to your backend instance
npm run dev
```

Environment variables:

```env
NEXT_PUBLIC_API_URL=          # Backend API base URL
NEXT_PUBLIC_INTAKE_BASE_URL=  # Base URL for intake links (e.g. yourtool.com/intake)
```

Backend setup is documented in the private `haven-backend` repo.

---

## Status

Currently in active development. V1 feature scope is locked. Backend RAG pipeline and PDF generation are the active build surfaces.

---

## License

Frontend repo: MIT  
Backend repo: Proprietary — all rights reserved

---

*Built by [Your Name] — [portfolio link] · [LinkedIn]*