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
