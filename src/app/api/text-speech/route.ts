import { NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { text, voiceId = "JBFqnCBsd6RMkjVDRZzb" } = await req.json();

    // Generate the audio stream
    const audioStream = await elevenlabs.textToSpeech.stream(voiceId, {
      text,
      modelId: "eleven_multilingual_v2",
    });

    // Convert the stream to a buffer
    // Convert the stream to a buffer
const chunks: Uint8Array[] = [];
const reader = audioStream.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  chunks.push(value);
}

const audioBuffer = Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'inline; filename="tts.mp3"',
      },
    });
  } catch (error) {
    console.error("TTS Error:", error);
    return NextResponse.json({ error: "Failed to generate TTS" }, { status: 500 });
  }
}
