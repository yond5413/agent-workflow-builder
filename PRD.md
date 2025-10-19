# 🧩 PRD: Diagram-Based Agent Workflow Builder (MVP)

## Overview
This project aims to create a **visual, node-based workflow builder** for constructing and executing AI-powered tasks — an open-source, modular alternative to **n8n**, **sim.ai**, and **OpenAI AgentKit**.

Users will be able to visually connect “nodes” representing AI tasks (e.g., web scraping, LLM responses, embeddings) into executable workflows.

In the **MVP**, workflows will:
- Be serialized and saved as **JSON** (no DB yet)
- Be validated by a **workflow management system**
- Be executed **manually** (with scheduling support to come later)
- Support killing/terminating a running job

---

## 1. System Architecture

### 🧑‍💻 User Layer (Frontend)
- **Built with Next.js + React Flow**
- Users can:
  - Create, connect, and rearrange workflow nodes
  - Configure node parameters (model, schema, etc.)
  - View node execution states (idle, running, success, error)
  - Save workflows as JSON
  - Trigger or kill workflow runs manually

**Key UI Components**
- Canvas: Node-based diagram editor (React Flow)
- Sidebar: Node configuration & parameter editor
- Log panel: Displays live execution logs
- Toolbar: Run, Stop, Save, and Load buttons

---

### ⚙️ Workflow Management System (Backend)

#### Overview
The backend will be **split** into:
1. **Next.js API routes** for orchestration, validation, and lightweight job management.
2. **FastAPI microservice(s)** for compute-heavy or async operations (e.g., web scraping, LLM inference, embeddings).

This separation ensures flexibility for local or remote execution environments.

#### Components
1. **Validator (Next.js)**
   - Validates workflow JSON schema
   - Ensures input/output compatibility between connected nodes
   - Checks required parameters per node type

2. **Engine (Next.js)**
   - Executes nodes sequentially or in parallel (based on DAG)
   - Passes data between nodes
   - Tracks intermediate results and logs

3. **Task Workers (FastAPI)**
   - Handle heavier or external calls (scraping, embeddings, LLMs)
   - Expose endpoints consumed by the engine
   - Can scale independently

4. **Scheduler (Stub for MVP)**
   - Future component for recurring or event-based runs
   - MVP: manual triggers only, no cron or queue system

5. **Job Controller**
   - Maintains in-memory record of active jobs
   - Allows killing/cancelling jobs mid-execution
   - Tracks job status (running, killed, success, error)

---

### 🗂 Storage
- **No database** in MVP — workflows are stored as JSON files.
- Example schema:
  ```json
  {
    "id": "workflow_001",
    "nodes": [
      { "id": "web_1", "type": "web_scraper", "data": { "url": "https://example.com" } },
      { "id": "llm_1", "type": "llm_task", "data": { "prompt": "Summarize this content." } }
    ],
    "edges": [
      { "source": "web_1", "target": "llm_1" }
    ],
    "metadata": {
      "created_by": "user123",
      "created_at": "2025-10-16"
    }
  }
2. Core Node Types (MVP)
Node Type	Description	Inputs	Outputs	Configurable Params
Web Scraping Node	Fetches and summarizes webpage content.	URL	Text summary	scraper_type (simple/LLM), max_length
Structured Output Extractor	LLM-based parser for structured data extraction.	Raw text	JSON object	schema, model
Embedding Generator	Generates vector embeddings from text.	Text	Vector	model, embedding_dim
Similarity Search Node	Queries a vector store for similar items.	Query vector	Matching results	k, similarity_metric
LLM Task Node	Executes text generation or reasoning tasks.	Prompt	Generated text	model, temperature, top_k
Data Input Node	Entry point for external data (text, JSON).	-	Data payload	input_schema
Data Output Node	Final output node for workflow results.	Data	-	output_schema
3. Extensibility

Users can:

Add custom service nodes via JSON or YAML definitions.

Define:

Input/output schema

Execution handler (HTTP endpoint, Python/Node function, etc.)

(Future) Marketplace for community nodes and templates.

Example custom node definition:

name: sentiment_analyzer
inputs: ["text"]
outputs: ["sentiment_score"]
handler: "https://api.mycustomservice.com/analyze"
params:
  model: "bert-mini"

4. Execution Flow

User builds workflow in the React Flow canvas.

System serializes it into JSON.

Validator (Next.js API) checks schema and node compatibility.

Engine executes nodes in topological order:

Lightweight nodes run locally in Next.js.

Heavy tasks (scraping, LLM, embeddings) routed to FastAPI endpoints.

UI updates node states in real-time (idle → running → success/error).

Manual execution only in MVP (scheduler hooks reserved).

5. Visual & UX Design

Primary UI Zones

Canvas (React Flow)

Drag-and-drop node creation

Connect nodes visually

Zoom/pan support

Sidebar (Config Panel)

Configure selected node’s parameters

Display input/output previews

Bottom Panel (Logs & Results)

Live log stream per node

Display intermediate and final results

Toolbar Buttons

▶️ Run Workflow

⏹️ Stop Workflow

💾 Save JSON

📄 Load JSON

6. Technical Architecture Diagram
                    ┌──────────────────────────┐
                    │   Next.js (Frontend + API)│
                    │  - React Flow Canvas      │
                    │  - Validator + Engine     │
                    │  - Job Controller         │
                    └──────────────┬────────────┘
                                   │
                                   ▼
                        ┌────────────────────┐
                        │   FastAPI Services  │
                        │ - Web Scraping      │
                        │ - LLM Inference     │
                        │ - Embedding Jobs    │
                        └────────┬───────────┘
                                 │
                                 ▼
                      ┌────────────────────────┐
                      │ JSON Workflow Storage  │
                      │ (Local or File System) │
                      └────────────────────────┘

7. Future Extensions
Area	Description
Persistence	Database-backed workflow storage and versioning.
Scheduling	Cron jobs and event-driven triggers.
Auth & Workspaces	Multi-user support with permissions.
Community Plugins	Node marketplace or registry.
External Integrations	LangChain, OpenAI APIs, Pinecone, Supabase, etc.
Analytics & Monitoring	Execution performance tracking, error reporting.
8. MVP Goals & Deliverables

✅ Frontend

Next.js app using React Flow

Core node palette

Config panel

Run/Stop buttons

Save/Load workflows as JSON

✅ Backend

Next.js API for validation & execution

FastAPI endpoints for heavy jobs

Kill job endpoint

Basic logs and state tracking

✅ Stretch

Add scheduler API stub

Add visual execution trace

9. Success Criteria

User can visually build a workflow using at least 3 node types.

Workflow can be exported to valid JSON.

Validation detects missing inputs/outputs.

Engine executes sequential nodes successfully.

User can start and stop (kill) a running job.

10. Tech Stack (MVP)
Layer	Tech
Frontend	Next.js (App Router), React Flow, TypeScript, TailwindCSS, Zustand
Backend (Light)	Next.js API Routes (Edge Runtime optional)
Backend (Heavy)	FastAPI (Python) for compute-intensive tasks
Data Storage	Local JSON files
Execution Runtime	In-process (spawned tasks or FastAPI calls)
11. Architectural Rationale

Next.js for orchestration & UI:
Fast iteration, seamless frontend/backend integration, and SSR for sharing workflows publicly.

FastAPI for heavy compute:
Async-friendly for scraping, embeddings, and LLM tasks that shouldn’t block Next.js routes.

JSON-first (no DB):
Simplifies MVP iteration, allows schema evolution and easy export/import.

Manual execution:
Focused on correctness, debuggability, and transparency before automating scheduling.