import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "edge";

export async function POST(req: Request) {
  const { text } = await req.json();

  if (!text) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });
  }

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Changed to gpt-4o-mini
      messages: [
        { role: "system", content: "You are an AI assistant that rewrites or summarizes text. The input may contain transcription errors due to voice recognition. Your task is to correct these errors and improve the overall clarity and coherence of the text. Provide the rewritten text without any quotation marks." },
        { role: "user", content: `Please rewrite or summarize the following text, correcting any potential transcription errors: ${text}` }
      ],
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || '';
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Error rewriting text:', error);
    return NextResponse.json({ error: 'Failed to rewrite text' }, { status: 500 });
  }
}