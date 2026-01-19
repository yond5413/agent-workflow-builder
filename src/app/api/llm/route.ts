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
    console.log("[LLM API] Request body:", JSON.stringify(body, null, 2));

    const {
      prompt,
      messages,
      model = "xiaomi/mimo-v2-flash:free",
      temperature = 0.7,
      max_tokens = 1000,
    } = body;

    // Proper input handling: support both prompt and messages
    let apiMessages = messages;

    if (!apiMessages) {
      if (!prompt) {
        return NextResponse.json(
          { success: false, error: "Either 'prompt' or 'messages' is required" },
          { status: 400 }
        );
      }
      apiMessages = [{ role: "user", content: prompt }];
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout

        const response = await fetch(OPENROUTER_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": request.headers.get("referer") || "http://localhost:3000",
          },
          body: JSON.stringify({
            model,
            messages: apiMessages,
            temperature,
            max_tokens,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error?.message || response.statusText;

          // Special handling for common errors
          if (response.status === 401) throw new Error("Invalid OpenRouter API Key");
          if (response.status === 429) throw new Error("Rate limit exceeded at OpenRouter");

          throw new Error(`OpenRouter API error (${response.status}): ${errorMessage}`);
        }

        const result = await response.json();
        const content = result.choices?.[0]?.message?.content || "No response generated";

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

        // Don't retry on abort, 400s, or auth errors
        if (
          lastError.name === "AbortError" ||
          lastError.message.includes("(400)") ||
          lastError.message.includes("401")
        ) {
          break;
        }

        if (attempt < MAX_RETRIES - 1) {
          await sleep(RETRY_DELAY * Math.pow(2, attempt));
        }
      }
    }

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
