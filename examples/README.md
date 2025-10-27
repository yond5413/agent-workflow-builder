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

### 4. Text to Speech Workflow (`text-to-speech-workflow.json`)
Demonstrates converting text to speech audio using ElevenLabs API.

**Nodes:**
- Input → Text to Speech → Output

**Use Case:** Convert written text into natural-sounding audio narration

**Required API Keys:** `ELEVENLABS_API_KEY`

---

### 5. Text to Image Workflow (`text-to-image-workflow.json`)
Shows how to generate images from text prompts using Cloudflare AI.

**Nodes:**
- Input → Text to Image → Output

**Use Case:** Generate images from descriptive text prompts

**Required API Keys:** `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`

---

### 6. Creative Content Pipeline (`creative-content-pipeline.json`)
Advanced workflow demonstrating chaining multiple media generation nodes.

**Nodes:**
- Input → LLM (Story Generator) → [Text to Speech, LLM (Scene Descriptions)] → [Text to Image (x3)] → Output

**Use Case:** Generate a complete content package including story text, audio narration, and scene images

**Required API Keys:** OpenRouter API, `ELEVENLABS_API_KEY`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`

---

### 7. Embedding Generator Demo (`embedding-generator-workflow.json`)
Basic workflow demonstrating text-to-vector embedding conversion.

**Nodes:**
- Input → Embedding Generator → Output

**Use Case:** Convert text into numerical vector representations for semantic search and AI applications

**Required API Keys:** `COHERE_API_KEY`

---

### 8. Knowledge Base Builder (`knowledge-base-builder.json`)
Intermediate workflow demonstrating how to build a searchable knowledge base.

**Nodes:**
- Input → Embedding Generator → Vector Store → Output

**Use Case:** Process FAQ documents, generate embeddings, and store them in Qdrant for semantic search

**Required API Keys:** `COHERE_API_KEY`, `QDRANT_URL`, `QDRANT_API_KEY`

**Smart Text Splitting:** The Embedding Generator automatically detects and splits:
- Documents separated by double newlines (`\n\n`) - each chunk becomes a separate vector
- JSON arrays of strings - each array element becomes a separate vector
- This allows storing multiple FAQ entries as individual, searchable documents

**Note:** This workflow creates the `faq_collection` that is used by workflows #9 and #10. Run this first before trying the search workflows.

---

### 9. Semantic Search Query (`semantic-search-query.json`)
Intermediate workflow demonstrating natural language search over a vector database.

**Nodes:**
- Input → Similarity Search → Output

**Use Case:** Search through stored documents using natural language queries with automatic embedding

**Required API Keys:** `COHERE_API_KEY`, `QDRANT_URL`, `QDRANT_API_KEY`

**Prerequisites:** Run workflow #8 (Knowledge Base Builder) first to populate the `faq_collection`

---

### 10. RAG Pipeline Complete (`rag-pipeline-complete.json`)
Advanced workflow demonstrating a complete Retrieval Augmented Generation system.

**Nodes:**
- Input → Similarity Search → LLM Task → Output

**Use Case:** AI assistant that retrieves relevant context from a knowledge base and generates informed, accurate responses

**Required API Keys:** OpenRouter API, `COHERE_API_KEY`, `QDRANT_URL`, `QDRANT_API_KEY`

**Prerequisites:** Run workflow #8 (Knowledge Base Builder) first to populate the `faq_collection`

---

## How to Use

1. Open the Workflow Builder at http://localhost:3000
2. Click the **"Load"** button in the toolbar
3. Select one of the example JSON files
4. Click **"Run Workflow"** to execute it
5. Watch the execution logs and see the results!

## Setting Up Vector & Embedding Services

Workflows #7-10 use vector embeddings and semantic search. You'll need to set up:

### Cohere (for embeddings)
1. Sign up at [cohere.ai](https://cohere.ai/)
2. Get your API key from the dashboard
3. Set environment variable: `COHERE_API_KEY=your_key_here`

### Qdrant (for vector storage)
1. Sign up at [qdrant.tech](https://qdrant.tech/) for cloud hosting, or run locally with Docker
2. Get your cluster URL and API key
3. Set environment variables:
   - `QDRANT_URL=your_cluster_url`
   - `QDRANT_API_KEY=your_api_key`

**Local Qdrant Setup (Docker):**
```bash
docker run -p 6333:6333 qdrant/qdrant
```
Then set `QDRANT_URL=http://localhost:6333`

---

## Media Outputs & Export

Media-generating nodes now include built-in playback and download features:

### Text to Speech Node
- 🔊 **Audio Player**: Listen to generated audio directly in the node
- 📥 **Download Button**: Export audio as `.mp3` file

### Text to Image Node
- 🖼️ **Image Preview**: View generated images directly in the node
- 📥 **Download Button**: Save images as `.jpg` file
- 💡 **Tip**: Click the image preview to download

### Image to Video Node
- 🎬 **Video Player**: Preview generated videos in the node
- 📥 **Download Button**: Export videos as `.mp4` file

### Embedding Generator Node
- 🧬 **Smart Text Processing**: Automatically detects input format
- 📝 **Batch Processing**: Splits double-newline separated text (`\n\n`) into multiple documents
- 📊 **JSON Array Support**: Processes JSON arrays of strings as separate documents
- 💡 **Use Case**: Easily embed multiple FAQ entries, articles, or documents in one workflow

### Vector Store Node
- 🗄️ **Storage Confirmation**: Shows collection name and number of vectors stored
- 💾 **Qdrant Integration**: Automatically creates collections if they don't exist
- 📖 **Reference**: Uses [Qdrant's point storage API](https://qdrant.tech/documentation/concepts/points/)
- 🔗 **Text Preservation**: Stores original text with each vector for retrieval

### Output Node
- 📊 **Output Preview**: Shows media type indicators (image/audio/video)
- 📥 **Export JSON**: Export complete workflow output as JSON

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

