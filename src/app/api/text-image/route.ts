// app/api/generate/route.ts (Next.js 13+ with App Router)
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { prompt } = await request.json();

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/lykon/dreamshaper-8-lcm`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }

  // The model returns binary image data
  const arrayBuffer = await res.arrayBuffer();
  return new Response(arrayBuffer, {
    headers: { "Content-Type": "image/jpeg" },
  });
}
