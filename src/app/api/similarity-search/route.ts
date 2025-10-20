import { NextRequest, NextResponse } from "next/server";
import { QdrantClient } from "@qdrant/js-client-rest";
import { CohereClient } from "cohere-ai";

// Initialize Qdrant client
const getQdrantClient = () => {
  const url = process.env.QDRANT_URL;
  const apiKey = process.env.QDRANT_API_KEY;

  if (!url || !apiKey) {
    throw new Error("QDRANT_URL and QDRANT_API_KEY must be configured");
  }

  return new QdrantClient({
    url,
    apiKey,
  });
};

// Initialize Cohere client for text-to-embedding conversion
const getCohereClient = () => {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) {
    throw new Error("COHERE_API_KEY is not configured");
  }
  return new CohereClient({ token: apiKey });
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      collectionName,
      vector,
      queryText,
      topK = 5,
      scoreThreshold = 0.7,
      model = "embed-english-v3.0",
    } = body;

    if (!collectionName) {
      return NextResponse.json(
        { success: false, error: "Collection name is required" },
        { status: 400 }
      );
    }

    let queryVector = vector;

    // If queryText is provided instead of vector, generate embedding
    if (!queryVector && queryText) {
      try {
        const cohere = getCohereClient();
        const embedResponse = await cohere.embed({
          texts: [queryText],
          model,
          inputType: "search_query",
        });
        const embeddings = embedResponse.embeddings as number[][];
        queryVector = embeddings[0];
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: `Failed to generate embedding from query text: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          },
          { status: 500 }
        );
      }
    }

    if (!queryVector) {
      return NextResponse.json(
        { success: false, error: "Either vector or queryText is required" },
        { status: 400 }
      );
    }

    // Validate topK
    if (topK < 1 || topK > 100) {
      return NextResponse.json(
        { success: false, error: "topK must be between 1 and 100" },
        { status: 400 }
      );
    }

    const qdrant = getQdrantClient();

    try {
      // Check if collection exists
      const collections = await qdrant.getCollections();
      const collectionExists = collections.collections.some(
        (c) => c.name === collectionName
      );

      if (!collectionExists) {
        return NextResponse.json(
          {
            success: false,
            error: `Collection '${collectionName}' does not exist. Please create it first.`,
          },
          { status: 404 }
        );
      }

      // Perform similarity search
      const searchResult = await qdrant.search(collectionName, {
        vector: queryVector,
        limit: topK,
        score_threshold: scoreThreshold,
      });

      return NextResponse.json({
        success: true,
        data: {
          results: searchResult,
          collectionName,
          topK,
          scoreThreshold,
          count: searchResult.length,
        },
      });
    } catch (error) {
      // Handle Qdrant API errors
      if (error instanceof Error) {
        return NextResponse.json(
          {
            success: false,
            error: `Qdrant API error: ${error.message}`,
          },
          { status: 500 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Similarity search error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Similarity search failed",
      },
      { status: 500 }
    );
  }
}

