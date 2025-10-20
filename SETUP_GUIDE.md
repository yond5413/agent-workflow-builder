# Setup Guide for Agent Workflow Builder

This guide will help you set up the Agent Workflow Builder with all required API integrations.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- API keys for the following services (see below for sign-up links)

## Installation

1. Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd agent-workflow-builder
npm install
```

## API Key Setup

### Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# OpenRouter API Key (for LLM tasks)
OPENROUTER_API_KEY=your_openrouter_key_here

# Firecrawl API Key (for web scraping)
FIRECRAWL_API_KEY=your_firecrawl_key_here

# Cohere API Key (for embeddings)
COHERE_API_KEY=your_cohere_key_here

# Qdrant Cloud Configuration (for vector search)
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your_qdrant_key_here
```

### 1. OpenRouter API Key

**Purpose:** Powers LLM tasks and structured data extraction

**Sign up:** https://openrouter.ai/

**Steps:**
1. Create an account at OpenRouter
2. Navigate to API Keys section
3. Generate a new API key
4. Add to `.env.local` as `OPENROUTER_API_KEY`

**Free tier:** Available with multiple free models

### 2. Firecrawl API Key

**Purpose:** Advanced web scraping with clean markdown output

**Sign up:** https://firecrawl.dev/

**Steps:**
1. Create an account at Firecrawl
2. Go to your dashboard
3. Copy your API key
4. Add to `.env.local` as `FIRECRAWL_API_KEY`

**Free tier:** 500 requests/month

### 3. Cohere API Key

**Purpose:** Generate text embeddings for semantic search

**Sign up:** https://cohere.com/

**Steps:**
1. Create an account at Cohere
2. Navigate to API Keys in dashboard
3. Copy your production or trial key
4. Add to `.env.local` as `COHERE_API_KEY`

**Free tier:** 100 API calls/minute, limited monthly tokens

### 4. Qdrant Cloud Setup

**Purpose:** Vector database for similarity search

**Sign up:** https://cloud.qdrant.io/

**Steps:**
1. Create an account at Qdrant Cloud
2. Create a new cluster (free tier available)
3. Once created, note your cluster URL (e.g., `https://xyz.qdrant.io`)
4. Generate an API key from the cluster settings
5. Add both to `.env.local`:
   - `QDRANT_URL=https://your-cluster.qdrant.io`
   - `QDRANT_API_KEY=your_qdrant_key_here`

**Free tier:** 1 GB storage

#### Creating a Collection in Qdrant

Before using the Similarity Search node, you need to create a collection:

1. **Via Qdrant Dashboard:**
   - Go to your Qdrant cluster dashboard
   - Create a new collection
   - Set vector size to `1024` (for Cohere embeddings)
   - Set distance metric to `Cosine`

2. **Via API (using the workflow builder):**
   - Use the Vector Store API endpoint
   - POST to `/api/vector-store` with your first embedding
   - The collection will be created automatically

Example using curl:
```bash
curl -X POST http://localhost:3000/api/vector-store \
  -H "Content-Type: application/json" \
  -d '{
    "collectionName": "my_collection",
    "vectorSize": 1024,
    "points": [
      {
        "id": 1,
        "vector": [...], 
        "payload": {"text": "sample document"}
      }
    ]
  }'
```

## Running the Application

Once you've set up all API keys:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Verifying Setup

### Test Each Service

1. **OpenRouter (LLM):** 
   - Create an Input node with some text
   - Add an LLM Task node with a prompt
   - Connect and run the workflow

2. **Firecrawl (Web Scraper):**
   - Create a Web Scraper node
   - Enter a URL (e.g., `https://example.com`)
   - Run the workflow
   - Check that markdown content is returned

3. **Cohere (Embeddings):**
   - Create an Input node with text
   - Add an Embedding Generator node
   - Run the workflow
   - Check that a vector array is returned

4. **Qdrant (Similarity Search):**
   - First, ensure you have a collection with data
   - Create a Similarity Search node
   - Enter your collection name
   - Provide a query text or vector
   - Run the workflow

## Troubleshooting

### Common Issues

**"API key not configured" errors:**
- Ensure `.env.local` is in the root directory
- Restart the dev server after adding/changing env variables
- Check that variable names exactly match those shown above

**Firecrawl scraping fails:**
- Verify the URL is accessible and not blocked by robots.txt
- Check that the target site doesn't have aggressive anti-scraping measures
- Try a simple site like `https://example.com` first

**Qdrant collection not found:**
- Ensure you've created the collection first
- Verify the collection name matches exactly (case-sensitive)
- Check that your cluster URL is correct and accessible

**Cohere embedding errors:**
- Verify your API key is valid
- Check you haven't exceeded rate limits (100 calls/min on free tier)
- Ensure input text is not too long (max ~512 tokens per chunk)

### Getting Help

If you encounter issues:
1. Check the browser console for detailed error messages
2. Check the Network tab to see the actual API responses
3. Verify all environment variables are set correctly
4. Ensure all API services are accessible and not rate-limited

## Example Workflow

Here's a complete example workflow using all node types:

1. **Input Node:** Provide a URL
2. **Web Scraper Node:** Scrape the URL content
3. **Structured Output Node:** Extract title, summary, and key points
4. **Embedding Generator Node:** Generate embedding of the summary
5. **Similarity Search Node:** Find similar documents in your collection
6. **LLM Task Node:** Synthesize findings into a report
7. **Output Node:** Display the final result

## Rate Limits and Quotas

Be aware of the free tier limitations:

- **OpenRouter:** Varies by model, check their pricing page
- **Firecrawl:** 500 requests/month
- **Cohere:** 100 calls/minute, limited monthly tokens
- **Qdrant:** 1 GB storage, unlimited requests

For production use, consider upgrading to paid plans.

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. Use separate API keys for development and production
3. Regularly rotate API keys
4. Monitor API usage to detect unauthorized access
5. Use environment-specific keys when deploying

## Next Steps

- Check out the [QUICKSTART.md](./QUICKSTART.md) for workflow examples
- Review the [README.md](./README.md) for architecture details
- Explore example workflows in the `examples/` directory

---

For additional support, please open an issue on GitHub or consult the official documentation for each service.

