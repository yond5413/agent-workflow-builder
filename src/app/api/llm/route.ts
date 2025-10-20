import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { success: false, error: "OPENROUTER_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      prompt,
      model = "openai/gpt-3.5-turbo",
      temperature = 0.7,
      max_tokens = 1000,
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    let lastError: Error | null = null;

    // Retry logic with exponential backoff
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

        const response = await fetch(OPENROUTER_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": request.headers.get("referer") || "http://localhost:3000",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            temperature,
            max_tokens,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `OpenRouter API error (${response.status}): ${
              errorData.error?.message || response.statusText
            }`
          );
        }

        const result = await response.json();
        const content =
          result.choices?.[0]?.message?.content || "No response generated";

        return NextResponse.json({
          success: true,
          data: {
            content,
            model,
            usage: result.usage,
          },
        });
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on abort or bad request errors
        if (
          lastError.name === "AbortError" ||
          lastError.message.includes("(400)")
        ) {
          break;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < MAX_RETRIES - 1) {
          await sleep(RETRY_DELAY * Math.pow(2, attempt));
        }
      }
    }

    // All retries failed
    return NextResponse.json(
      {
        success: false,
        error: lastError?.message || "LLM request failed after retries",
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("LLM route error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

