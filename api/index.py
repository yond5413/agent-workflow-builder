from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv
from bs4 import BeautifulSoup
import json
from typing import Optional, Dict, Any

load_dotenv()

app = FastAPI(title="Workflow Builder API")

# CORS middleware for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")


class LLMTaskRequest(BaseModel):
    prompt: str
    model: str = "openai/gpt-3.5-turbo"
    temperature: float = 0.7
    max_tokens: int = 1000


class WebScrapeRequest(BaseModel):
    url: str
    max_length: Optional[int] = 5000


class StructuredExtractRequest(BaseModel):
    text: str
    schema: Dict[str, Any]
    model: str = "openai/gpt-3.5-turbo"


class APIResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "workflow-builder-api"}


@app.post("/api/fastapi/llm-task", response_model=APIResponse)
async def llm_task(request: LLMTaskRequest):
    """Execute an LLM task using OpenRouter API"""
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY not configured")
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",
                },
                json={
                    "model": request.model,
                    "messages": [{"role": "user", "content": request.prompt}],
                    "temperature": request.temperature,
                    "max_tokens": request.max_tokens,
                },
            )
            response.raise_for_status()
            result = response.json()
            
            content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
            
            return APIResponse(
                success=True,
                data={"content": content, "model": request.model}
            )
    except httpx.TimeoutException:
        return APIResponse(success=False, error="Request timed out")
    except httpx.HTTPStatusError as e:
        return APIResponse(success=False, error=f"API error: {e.response.status_code}")
    except Exception as e:
        return APIResponse(success=False, error=str(e))


@app.post("/api/fastapi/web-scrape", response_model=APIResponse)
async def web_scrape(request: WebScrapeRequest):
    """Scrape web content from a URL"""
    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            response = await client.get(request.url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style", "nav", "footer", "header"]):
                script.decompose()
            
            # Get text
            text = soup.get_text(separator='\n', strip=True)
            
            # Clean up text
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = '\n'.join(chunk for chunk in chunks if chunk)
            
            # Limit length
            if request.max_length and len(text) > request.max_length:
                text = text[:request.max_length] + "..."
            
            return APIResponse(
                success=True,
                data={"text": text, "url": request.url, "length": len(text)}
            )
    except httpx.TimeoutException:
        return APIResponse(success=False, error="Request timed out")
    except httpx.HTTPStatusError as e:
        return APIResponse(success=False, error=f"HTTP error: {e.response.status_code}")
    except Exception as e:
        return APIResponse(success=False, error=str(e))


@app.post("/api/fastapi/structured-extract", response_model=APIResponse)
async def structured_extract(request: StructuredExtractRequest):
    """Extract structured data from text using LLM with JSON schema"""
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY not configured")
    
    try:
        schema_str = json.dumps(request.schema, indent=2)
        prompt = f"""Extract information from the following text according to this JSON schema:

Schema:
{schema_str}

Text:
{request.text}

Return ONLY valid JSON matching the schema above, with no additional text or explanation."""

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",
                },
                json={
                    "model": request.model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                    "response_format": {"type": "json_object"}
                },
            )
            response.raise_for_status()
            result = response.json()
            
            content = result.get("choices", [{}])[0].get("message", {}).get("content", "{}")
            
            # Parse the JSON response
            try:
                structured_data = json.loads(content)
            except json.JSONDecodeError:
                structured_data = {"raw": content}
            
            return APIResponse(
                success=True,
                data={"structured_data": structured_data, "schema": request.schema}
            )
    except Exception as e:
        return APIResponse(success=False, error=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

