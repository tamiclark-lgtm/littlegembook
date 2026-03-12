import { NextResponse } from "next/server";
import { z } from "zod";
import { buildMockStory } from "@/lib/mock-story";
import { buildClaudePrompt } from "@/lib/prompt";
import { ChildDetails, THEMES } from "@/lib/types";

const inputSchema = z.object({
  childName: z.string().min(1),
  age: z.string().min(1),
  favoriteAnimal: z.string().min(1),
  favoriteColor: z.string().min(1),
  dedication: z.string().min(1),
  theme: z.enum(THEMES)
});

const storySchema = z.object({
  title: z.string(),
  dedicationPageText: z.string(),
  pages: z.array(
    z.object({
      pageNumber: z.number(),
      text: z.string()
    })
  ),
  moral: z.string()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = inputSchema.parse(body) as ChildDetails;

    const mockMode = process.env.MOCK_STORY_MODE === "true" || !process.env.ANTHROPIC_API_KEY;
    if (mockMode) {
      return NextResponse.json({ story: buildMockStory(parsed), source: "mock" });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY as string,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
        max_tokens: 1800,
        temperature: 0.7,
        messages: [{ role: "user", content: buildClaudePrompt(parsed) }]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const rawText = (data.content || [])
      .filter((item: { type: string }) => item.type === "text")
      .map((item: { text: string }) => item.text)
      .join("\n");

    const story = storySchema.parse(JSON.parse(rawText));
    return NextResponse.json({ story, source: "claude" });
  } catch (error) {
    console.error("generate-story error", error);
    return NextResponse.json({ error: "Unable to generate story right now." }, { status: 500 });
  }
}