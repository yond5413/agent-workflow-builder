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

## How to Use

1. Open the Workflow Builder at http://localhost:3000
2. Click the **"Load"** button in the toolbar
3. Select one of the example JSON files
4. Click **"Run Workflow"** to execute it
5. Watch the execution logs and see the results!

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

