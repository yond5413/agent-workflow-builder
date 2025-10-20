import { NextRequest, NextResponse } from "next/server";
import FirecrawlApp from "@mendable/firecrawl-js";

// Initialize Firecrawl client
const getFirecrawlClient = () => {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error("FIRECRAWL_API_KEY is not configured");
  }
  return new FirecrawlApp({ apiKey });
};

// SSRF Protection: Validate URL safety
const isUrlSafe = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    
    // Block local/internal addresses
    const hostname = parsed.hostname.toLowerCase();
    
    // Block localhost
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0") {
      return false;
    }
    
    // Block private IP ranges
    if (
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)
    ) {
      return false;
    }
    
    // Block link-local
    if (hostname.startsWith("169.254.")) {
      return false;
    }
    
    // Only allow http/https
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, max_length } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: "URL is required" },
        { status: 400 }
      );
    }

    // SSRF Protection
    if (!isUrlSafe(url)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or unsafe URL. Local/internal addresses are not allowed.",
        },
        { status: 400 }
      );
    }

    const firecrawl = getFirecrawlClient();

    // Scrape the URL with Firecrawl
    const result = await firecrawl.scrapeUrl(url, {
      formats: ["markdown", "html"],
      onlyMainContent: true,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to scrape URL",
        },
        { status: 500 }
      );
    }

    // Extract text from markdown (preferred) or fallback to HTML
    let text = result.markdown || "";
    
    // Limit length if specified
    if (max_length && text.length > max_length) {
      text = text.substring(0, max_length) + "...";
    }

    return NextResponse.json({
      success: true,
      data: {
        text,
        markdown: result.markdown,
        html: result.html,
        metadata: result.metadata,
        url,
        length: text.length,
      },
    });
  } catch (error) {
    console.error("Scrape error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Failed to scrape URL";
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

