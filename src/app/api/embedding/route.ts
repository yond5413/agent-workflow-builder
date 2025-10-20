import { NextRequest, NextResponse } from "next/server";
import { CohereClient } from "cohere-ai";

// Initialize Cohere client
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
      text,
      texts,
      model = "embed-english-v3.0",
      inputType = "search_document",
    } = body;

    // Support both single text and batch texts
    const textsToEmbed = texts || (text ? [text] : null);

    if (!textsToEmbed || textsToEmbed.length === 0) {
      return NextResponse.json(
        { success: false, error: "Text or texts array is required" },
        { status: 400 }
      );
    }

    // Validate input type
    const validInputTypes = [
      "search_document",
      "search_query",
      "classification",
      "clustering",
    ];
    if (!validInputTypes.includes(inputType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid inputType. Must be one of: ${validInputTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const cohere = getCohereClient();

    try {
      const response = await cohere.embed({
        texts: textsToEmbed,
        model,
        inputType,
      });

      // Extract embeddings from response
      const embeddings = response.embeddings as number[][];

      return NextResponse.json({
        success: true,
        data: {
          embeddings,
          model,
          inputType,
          count: Array.isArray(embeddings) ? embeddings.length : 0,
        },
      });
    } catch (error) {
      // Handle Cohere API errors
      if (error instanceof Error) {
        return NextResponse.json(
          {
            success: false,
            error: `Cohere API error: ${error.message}`,
          },
          { status: 500 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Embedding error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to generate embeddings",
      },
      { status: 500 }
    );
  }
}

