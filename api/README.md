# FastAPI Backend for Workflow Builder

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
- Windows: `venv\Scripts\activate`
- Unix/macOS: `source venv/bin/activate`

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file and add your OpenRouter API key:
```
OPENROUTER_API_KEY=your_key_here
```

5. Run the server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## Endpoints

- `GET /health` - Health check
- `POST /api/llm-task` - Execute LLM task
- `POST /api/web-scrape` - Scrape web content
- `POST /api/structured-extract` - Extract structured data with LLM

