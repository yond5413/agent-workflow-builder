# 🧩 Workflow Builder MVP

A visual, node-based workflow builder for constructing and executing AI-powered tasks. Built with Next.js, React Flow, and FastAPI.

![Workflow Builder](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green?logo=fastapi)

## ✨ Features

- **Visual Workflow Builder**: Drag-and-drop interface powered by React Flow
- **DAG-Based Execution**: Parallel execution of independent nodes for optimal performance
- **Multiple Node Types**:
  - 📥 Input Node - Starting point with data
  - 🤖 LLM Task - AI text generation via OpenRouter
  - 🌐 Web Scraper - Fetch and parse web content
  - 📊 Structured Output - Extract structured data with JSON schemas
  - 📤 Output Node - Final workflow results
- **Real-time Execution Monitoring**: Live logs and node state tracking
- **Import/Export Workflows**: Save and load workflows as JSON
- **Workflow Validation**: Automatic detection of cycles, disconnected nodes, and configuration errors

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+ and pip
- OpenRouter API key ([Get one here](https://openrouter.ai/))

### 1. Frontend Setup (Next.js)

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 2. Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd fastapi-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file and add your OpenRouter API key
echo "OPENROUTER_API_KEY=your_openrouter_api_key_here" > .env

# Start the FastAPI server
python main.py
```

The backend API will be available at `http://localhost:8000`

You can view the API docs at `http://localhost:8000/docs`

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
- **Model**: Choose from GPT-3.5, GPT-4, Claude, Gemini, etc.
- **Temperature**: Control randomness (0-2)
- **Max Tokens**: Maximum response length

#### Web Scraper Node
- **URL**: The webpage to scrape
- **Max Length**: Maximum text length to extract

#### Structured Output Node
- **JSON Schema**: Define the structure you want to extract
- **Model**: Choose the LLM model for extraction

#### Output Node
- No configuration needed - displays final results

## 🏗️ Architecture

### Frontend (Next.js + React)
- **React Flow**: Visual node editor
- **Zustand**: State management
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling

### Backend (FastAPI)
- **FastAPI**: High-performance async API
- **OpenRouter**: Unified LLM API access
- **BeautifulSoup**: Web scraping
- **HTTPX**: Async HTTP client

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
├── fastapi-backend/
│   ├── main.py                         # FastAPI application
│   ├── requirements.txt                # Python dependencies
│   └── README.md                       # Backend docs
└── PRD.md                              # Product Requirements Document
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
