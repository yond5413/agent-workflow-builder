# Example Workflows

This directory contains example workflows that you can load into the Workflow Builder to get started quickly.

## Available Examples

### 1. Simple LLM Workflow (`simple-llm-workflow.json`)
A basic workflow demonstrating how to use the LLM Task node.

**Nodes:**
- Input → LLM Task → Output

**Use Case:** Simple question-answering or text generation

---

### 2. Web Scraper Workflow (`web-scraper-workflow.json`)
Demonstrates web scraping and summarization.

**Nodes:**
- Web Scraper → LLM Task (Summarizer) → Output

**Use Case:** Scrape a webpage and generate a concise summary

---

### 3. Structured Extraction Workflow (`structured-extraction-workflow.json`)
Shows how to extract structured data from unstructured text.

**Nodes:**
- Input → Structured Output → Output

**Use Case:** Parse text and extract specific fields according to a JSON schema

---

## How to Use

1. Open the Workflow Builder at http://localhost:3000
2. Click the **"Load"** button in the toolbar
3. Select one of the example JSON files
4. Click **"Run Workflow"** to execute it
5. Watch the execution logs and see the results!

## Customizing Examples

Feel free to modify these examples:
- Change LLM models (GPT-4, Claude, etc.)
- Adjust temperature and max_tokens
- Modify prompts and schemas
- Add more nodes and create complex workflows

## Creating Your Own

After running these examples, try creating your own workflows by:
1. Clicking on node types in the left palette
2. Connecting nodes by dragging between handles
3. Configuring each node in the right panel
4. Saving your workflow with the **"Save"** button

