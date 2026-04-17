# Test Case Agentic AI Platform

An enterprise-grade full-stack application for generating test cases from Functional Design, Technical Design, API specs, and legacy documentation using a multi-agent LLM workflow.

## Key Features

- English-only UI, prompts, logs, and exported artifacts.
- Two-panel enterprise SaaS interface with live workflow progress.
- Multi-agent architecture (Supervisor + specialized agents), where each agent calls the active LLM provider.
- LLM provider abstraction with dynamic provider selection from `.env`:
  - DeepSeek
  - OpenAI
- RAG-ready parsing, chunking, retrieval, and traceability mapping.
- Professional test case table view with search and detail expansion.
- Dedicated tabs for Test Cases, Postman, SQL Validation, Coverage, Agent Logs, and Documents.
- Export endpoints for JSON, Markdown, CSV (Excel-compatible), and Postman collection JSON.

## Monorepo Structure

```text
.
├── frontend/                 # Next.js App Router + Tailwind enterprise UI
├── backend/                  # NestJS REST backend + workflow orchestration
├── sample-docs/              # Sample functional / technical docs
├── docker-compose.yml
└── .env.example
```

### Backend Modules

```text
backend/src/
├── auth/
├── project/
├── document/
├── parsing/
├── rag/
├── embedding/
├── llm/
├── agent/
├── workflow/
├── test-case/
├── postman/
├── sql-validation/
├── coverage/
├── export/
├── settings/
└── main.ts
```

## Environment Configuration

Copy `.env.example` to `.env` and set keys:

```bash
cp .env.example .env
```

Required variables:

- `LLM_PROVIDER` (`deepseek` or `openai`)
- `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL`
- `OPENAI_API_KEY`, `OPENAI_MODEL`
- `DATABASE_URL`
- `REDIS_URL`
- `NEXT_PUBLIC_API_BASE_URL`

## Run Locally

```bash
npm install
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Docker Run

```bash
docker compose up --build
```

Services:
- frontend (3000)
- backend (3001)
- postgres with pgvector (5432)
- redis (6379)

## Workflow Stages

1. Document Upload
2. Document Parsing
3. Knowledge Indexing
4. Requirement Analysis
5. Technical Analysis
6. Scenario Design
7. Test Case Generation
8. Postman Generation
9. SQL Validation Generation
10. Review and Coverage Analysis
11. Final Assembly

Each stage tracks status (`pending`, `running`, `completed`, `failed`), percentage progress, timestamps, and messages.

## API Highlights

- `POST /documents/:projectId` upload logical document payloads
- `POST /workflows/:projectId` start generation
- `GET /workflows/:id` fetch live workflow state for polling
- `GET /test-cases/:workflowId`
- `GET /postman/:workflowId`
- `GET /sql-validation/:workflowId`
- `GET /coverage/:workflowId`
- `GET /settings`
- `GET /export/:workflowId/json`
- `GET /export/:workflowId/markdown`
- `GET /export/:workflowId/excel`
- `GET /export/:workflowId/postman`

## Notes

- API keys are kept server-side only; frontend receives provider/model metadata only.
- If LLM output is not valid JSON, backend creates a deterministic fallback sample test case to keep the pipeline operable.
- The Test Cases tab renders table-based output (not raw JSON) with a dedicated detail panel.
