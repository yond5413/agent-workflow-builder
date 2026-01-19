# 🧩 Agent Workflow Builder

A visual, node-based workflow builder for constructing and executing AI-powered tasks. Built with Next.js and powered by Firecrawl, Cohere, and Qdrant.

![Workflow Builder](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)

## ✨ Features

- **Visual Workflow Builder**: Drag-and-drop interface powered by React Flow
- **DAG-Based Execution**: Parallel execution of independent nodes for optimal performance
- **AI-Powered Node Types**:
  - 📥 Input Node - Starting point with data
  - 🤖 LLM Task - AI text generation via OpenRouter
  - 🌐 Web Scraper - Advanced web scraping with Firecrawl
  - 📊 Structured Output - Extract structured data with JSON schemas
  - 🧬 Embedding Generator - Generate text embeddings with Cohere
  - 🔍 Similarity Search - Vector similarity search with Qdrant
  - 📤 Output Node - Final workflow results
- **Real-time Execution Monitoring**: Live logs and node state tracking
- **Import/Export Workflows**: Save and load workflows as JSON
- **Workflow Validation**: Automatic detection of cycles, disconnected nodes, and configuration errors
- **Full-Stack Next.js**: No Python backend required - all processing happens in Next.js API routes

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- API keys for:
  - [OpenRouter](https://openrouter.ai/) (LLM tasks)
  - [Firecrawl](https://firecrawl.dev/) (web scraping)
  - [Cohere](https://cohere.com/) (embeddings)
  - [Qdrant Cloud](https://cloud.qdrant.io/) (vector search)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd agent-workflow-builder

# Install dependencies
npm install

# Create .env.local file with your API keys
# See SETUP_GUIDE.md for detailed instructions
```

### Environment Setup

Create a `.env.local` file in the root directory:

```env
OPENROUTER_API_KEY=your_openrouter_key_here
FIRECRAWL_API_KEY=your_firecrawl_key_here
COHERE_API_KEY=your_cohere_key_here
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your_qdrant_key_here
```

**📖 See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed API key setup instructions.**

### Start the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📖 Usage

### Building a Workflow

1. **Add Nodes**: Click on node types in the left palette to add them to the canvas
2. **Connect Nodes**: Drag from one node's output (right) to another node's input (left)
3. **Configure Nodes**: Click on a node to configure its parameters in the right panel
4. **Execute**: Click "Run Workflow" to execute the workflow
5. **Monitor**: Watch real-time logs and node states during execution
6. **Save/Load**: Export workflows as JSON or load existing workflows

### Example Workflow

Here's a simple workflow that scrapes a website and summarizes it:

1. Add a **Web Scraper** node and set the URL
2. Add an **LLM Task** node and set the prompt to: "Summarize this content: {{input}}"
3. Connect the Web Scraper to the LLM Task
4. Add an **Output** node and connect it to the LLM Task
5. Click **Run Workflow**

### Node Configuration

#### Input Node
- **Payload**: Raw text or JSON data to start the workflow

#### LLM Task Node
- **Prompt**: The prompt for the LLM (use `{{input}}` to reference previous node output)
- **Model**: Choose from available OpenRouter models
- **Temperature**: Control randomness (0-2)
- **Max Tokens**: Maximum response length

#### Web Scraper Node
- **URL**: The webpage to scrape
- **Max Length**: Maximum text length to extract
- Uses Firecrawl for advanced scraping with markdown output

#### Structured Output Node
- **JSON Schema**: Define the structure you want to extract
- **Model**: Choose the LLM model for extraction
- Automatically validates output against schema

#### Embedding Generator Node
- **Model**: Choose between embed-english-v3.0 or embed-multilingual-v3.0
- **Input Type**: search_document, search_query, classification, or clustering
- **Custom Text**: Optional text to embed (otherwise uses input from previous nodes)
- Generates 1024-dimensional vectors using Cohere

#### Similarity Search Node
- **Collection Name**: Name of the Qdrant collection to search
- **Top K**: Number of similar results to return (1-20)
- **Score Threshold**: Minimum similarity score (0-1)
- **Query Text**: Optional text query (will be auto-embedded if provided)
- Returns ranked results with similarity scores

#### Output Node
- No configuration needed - displays final results

## 🏗️ Architecture

### Full-Stack Next.js Application

#### Frontend
- **React Flow**: Visual node editor for drag-and-drop workflow building
- **Zustand**: Lightweight state management for workflow state
- **TypeScript**: Type safety across the entire application
- **Tailwind CSS**: Modern, utility-first styling

#### Backend (Next.js API Routes)
- **Next.js API Routes**: Serverless functions for all backend logic
- **OpenRouter**: Unified LLM API access for text generation and structured extraction
- **Firecrawl**: Advanced web scraping with markdown output and dynamic content support
- **Cohere**: Text embedding generation for semantic search
- **Qdrant Cloud**: Vector database for similarity search

### Data Flow

```
User Interface (React Flow)
         ↓
  Workflow Store (Zustand)
         ↓
  Workflow Engine (TypeScript)
         ↓
  Next.js API Routes
         ↓
  External APIs (OpenRouter, Firecrawl, Cohere, Qdrant)
```

### Execution Engine
- **DAG-based**: Topological sort for execution order
- **Parallel Execution**: Independent nodes run simultaneously
- **Real-time Updates**: Live log streaming
- **Cancellable**: Stop execution mid-workflow

## 📁 Project Structure

```
agent-workflow-builder/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── workflow/
│   │   │       ├── execute/route.ts    # Workflow execution endpoint
│   │   │       └── validate/route.ts   # Workflow validation endpoint
│   │   ├── page.tsx                    # Main application page
│   │   └── globals.css                 # Global styles
│   ├── components/
│   │   ├── nodes/                      # Custom node components
│   │   │   ├── BaseNode.tsx
│   │   │   ├── InputNode.tsx
│   │   │   ├── LLMTaskNode.tsx
│   │   │   ├── WebScraperNode.tsx
│   │   │   ├── StructuredOutputNode.tsx
│   │   │   └── OutputNode.tsx
│   │   ├── WorkflowCanvas.tsx          # React Flow canvas
│   │   ├── ConfigPanel.tsx             # Node configuration panel
│   │   ├── Toolbar.tsx                 # Top toolbar
│   │   ├── LogPanel.tsx                # Execution logs
│   │   └── NodePalette.tsx             # Node type palette
│   ├── lib/
│   │   ├── engine.ts                   # Workflow execution engine
│   │   ├── validator.ts                # Workflow validation
│   │   └── workflow-io.ts              # Import/export utilities
│   ├── store/
│   │   └── workflowStore.ts            # Zustand store
│   └── types/
│       └── workflow.ts                 # TypeScript types
```

## 🔧 Environment Variables

### FastAPI (api/.env)
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

## 🎯 Roadmap

- [x] Core workflow builder with React Flow
- [x] DAG-based parallel execution
- [x] 5 essential node types
- [x] Real-time execution logs
- [x] Import/export workflows
- [ ] Workflow templates library
- [ ] Custom node creation API
- [ ] Database persistence
- [ ] Scheduled workflow execution
- [ ] Multi-user support & authentication
- [ ] Node marketplace
- [ ] Advanced error handling & retry logic
- [ ] Workflow versioning

## 🐛 Troubleshooting

### FastAPI server not starting
- Ensure Python virtual environment is activated
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Verify OpenRouter API key is set in `.env`

### Workflows not executing
- Check that FastAPI server is running on `http://localhost:8000`
- The Next.js application automatically routes requests to FastAPI via `/api/fastapi/*`
- Check browser console and logs panel for errors

### CORS errors
- Ensure FastAPI server is configured to allow requests from `http://localhost:3000`
- Check that both servers are running

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js, React Flow, and FastAPI
