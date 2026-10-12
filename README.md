# SachCheck — AI-Powered Claim Verification Platform

> **"Don't Just Forward. Verify."**

SachCheck is an end-to-end multimodal misinformation detection and claim verification platform. It features an **8-stage verification pipeline** that cross-examines claims against live grounded search, fact-check databases, and challenger/auditor AI agents, accessible via both a modern React web frontend and a Chrome Extension.

---

## Architecture Overview

```
ChromEx/
├── backend/ (or server/)        # Express + TypeScript Verification Engine & Pipeline
│   ├── src/
│   │   ├── pipeline/            # 8-Stage Verification Architecture
│   │   ├── routes/              # REST API Routes (/api/verify, /api/history, /api/health, ...)
│   │   ├── providers/           # Gemini, Tavily, Google FactCheck integrations
│   │   ├── database/            # SQLite storage & migrations (WAL mode)
│   │   └── security/            # Rate limiting, Prompt injection guardrails, Redaction
│   ├── data/                    # Persistent SQLite database
│   └── uploads/                 # Temporary upload buffer
├── frontend/                    # Modern React 19 + Vite + Tailwind CSS Web App
│   ├── src/
│   │   ├── components/          # Verification UI, Verdict Cards, Claim Breakdowns
│   │   ├── pages/               # Dashboard, Verify, History, Demo showcases
│   │   └── services/            # Axios API client
└── extension/                   # Manifest V3 Chrome Extension
    ├── content/                 # WhatsApp Web inline marker & web selection reader
    └── popup/                   # Browser action interface
```

### The 8-Stage Verification Pipeline

1. **Stage 1: Input Processor & Multimodal Ingestion** — Sanitizes input, enforces consent, processes raw text, images (Tesseract OCR), PDFs, URLs (cheerio scraper), and audio.
2. **Stage 2: Claim Extractor** — Deconstructs complex inputs into atomic, verifiable factual propositions.
3. **Stage 3: Evidence Retriever** — Queries Google Gemini with Search Grounding, Tavily Search, and Google Fact Check Tools API.
4. **Stage 4: Source Analyzer** — Evaluates source credibility, authority scores, publication dates, and institutional reputation.
5. **Stage 5: Claim Comparator** — Cross-references each atomic claim against retrieved evidence for stance detection.
6. **Stage 6: Challenger Agent** — Plays devil's advocate to detect confirmation bias, nuance loss, and alternative explanations.
7. **Stage 7: Evidence Auditor** — Strict quality control auditor that downgrades verdicts if evidence fails threshold criteria.
8. **Stage 8: Verdict Synthesizer** — Consolidates findings into the overall verdict, explanatory breakdown, confidence score, and one-click WhatsApp rebuttal text.

---

## The Five Verdict Types

SachCheck evaluates claims into five calibrated verdicts:

| Verdict | Meaning & Criteria |
| :--- | :--- |
| **`VERIFIED`** | The claim is backed by credible, authoritative, and corroborating primary sources with high consensus. |
| **`FALSE`** | The claim is demonstrably inaccurate, debunked by established fact-checkers, or directly contradicts verifiable evidence. |
| **`OUTDATED`** | The information was once accurate but is no longer valid due to recent updates, changed laws, or superseded scientific findings. |
| **`PARTIALLY_SUPPORTED`** | The core claim contains elements of truth mixed with exaggerations, missing context, or unverified secondary assertions. |
| **`CANNOT_CONFIRM`** | Insufficient or conflicting evidence exists to definitively confirm or refute the claim at this time. |

---

## Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, TypeScript, Lucide React, Axios, React Router
- **Backend**: Express, TypeScript, Node.js (`tsx`), Helmet, CORS, Multer
- **Database**: SQLite (`node:sqlite` in WAL mode) with zero-dependency native execution
- **AI & Fact Checking**:
  - Google Gemini 2.0 Flash (`@google/generative-ai`)
  - Tavily Search API
  - Google Fact Check Tools API
- **Document & Multimodal Processing**:
  - `tesseract.js` (Optical Character Recognition)
  - `pdf-parse` (PDF extraction)
  - `cheerio` (Webpage scraping)

---

## Setup Instructions

### Prerequisites
- Node.js 20+ installed
- npm 9+ installed

### 1. Clone & Configure Environment

Copy `.env.example` to `.env` in the root and in the backend folder:

```bash
cp .env.example .env
```

Set your API keys:
```env
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,chrome-extension://*

GEMINI_API_KEY=your_gemini_api_key_here
TAVILY_API_KEY=your_optional_tavily_key
GOOGLE_FACTCHECK_API_KEY=your_optional_google_factcheck_key
```

> **Note:** If `GEMINI_API_KEY` is not provided, SachCheck automatically runs in a self-contained **Offline Demo Mode** with realistic simulated pipeline outputs.

---

## How to Run in Development

Run both the backend API and the Vite frontend concurrently:

```bash
# Run both frontend & backend
npm run dev

# Or run backend individually:
npm run dev:backend

# Or run frontend individually:
npm run dev:frontend
```

- **Frontend UI**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000`
- **Health Check**: `http://localhost:3000/api/health`

---

## API Endpoints Reference

### Verification
- **`POST /api/verify`**
  - Content-Type: `application/json` or `multipart/form-data`
  - Body:
    - `inputType`: `'text' | 'url' | 'image' | 'pdf' | 'audio' | 'whatsapp_selection'`
    - `content` / `text`: Claim text or URL
    - `consent`: `true` *(required)*
    - `file`: Multipart file upload (images, PDFs, audio)
  - Returns complete 8-stage result including atomic claims, sources, and WhatsApp rebuttal.

### History & Sessions
- **`POST /api/auth/session`** — Create or refresh an anonymous user session.
- **`GET /api/history`** — List verification history for the active session.
- **`GET /api/history/:id`** — Retrieve a full verification record by ID.
- **`DELETE /api/history/:id`** — Remove a verification record from history.

### Health & System
- **`GET /api/health`** — System status, API keys configured, active AI models.
- **`GET /api/demo/cases`** — List built-in demo cases (viral forwards, image claims, health myths).
- **`POST /api/demo/run/:id`** — Run a pre-configured demo test case immediately.

---

## Production Build

```bash
# Build both frontend and backend
npm run build

# Start production server (serves frontend static build)
NODE_ENV=production npm run start
```
