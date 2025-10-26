import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { images, audioBase64 } = await req.json();
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: 'Provide at least one image as base64 string' },
        { status: 400 }
      );
    }

    // Just validate and return - client will process
    return NextResponse.json({
      success: true,
      images,
      audioBase64,
      status: 'ready_for_processing'
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: 'Request failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
