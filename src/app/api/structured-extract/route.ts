import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function POST(request: NextRequest) {
  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { success: false, error: "OPENROUTER_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { text, schema, model = "openai/gpt-3.5-turbo" } = body;

    if (!text) {
      return NextResponse.json(
        { success: false, error: "Text is required" },
        { status: 400 }
      );
    }

    if (!schema) {
      return NextResponse.json(
        { success: false, error: "Schema is required" },
        { status: 400 }
      );
    }

    // Validate schema is valid JSON
    let parsedSchema;
    try {
      parsedSchema =
        typeof schema === "string" ? JSON.parse(schema) : schema;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON schema" },
        { status: 400 }
      );
    }

    const schemaStr = JSON.stringify(parsedSchema, null, 2);
    const prompt = `Extract information from the following text according to this JSON schema:

Schema:
${schemaStr}

Text:
${text}

Return ONLY valid JSON matching the schema above, with no additional text or explanation.`;

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
          temperature: 0.3,
          response_format: { type: "json_object" },
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
      const content = result.choices?.[0]?.message?.content || "{}";

      // Parse and validate the extracted JSON
      let structuredData;
      try {
        structuredData = JSON.parse(content);
      } catch (parseError) {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to parse LLM response as JSON",
            raw: content,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          structured_data: structuredData,
          schema: parsedSchema,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return NextResponse.json(
          { success: false, error: "Request timed out" },
          { status: 408 }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error("Structured extract error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Structured extraction failed",
      },
      { status: 500 }
    );
  }
}

