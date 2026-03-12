import { ChildDetails } from "@/lib/types";

export function buildClaudePrompt(input: ChildDetails): string {
  return `You are writing a premium, warm children's story for the Little Gem Books cart MVP.

Return ONLY valid JSON with this exact shape:
{
  "title": "string",
  "dedicationPageText": "string",
  "pages": [
    { "pageNumber": 3, "text": "string" },
    { "pageNumber": 4, "text": "string" },
    { "pageNumber": 5, "text": "string" },
    { "pageNumber": 6, "text": "string" },
    { "pageNumber": 7, "text": "string" },
    { "pageNumber": 8, "text": "string" },
    { "pageNumber": 9, "text": "string" },
    { "pageNumber": 10, "text": "string" }
  ],
  "moral": "string"
}

Rules:
- Child name: ${input.childName}
- Child age: ${input.age}
- Favorite animal: ${input.favoriteAnimal}
- Favorite color: ${input.favoriteColor}
- Theme: ${input.theme}
- Dedication line from parent: ${input.dedication}
- Tone: magical, premium, kind, and age-appropriate.
- Keep each page text short enough for print readability (2-4 sentences max).
- No scary content and no sarcasm.
- Make the child the main hero.
- Moral should be one concise paragraph.
- Must be print-clean and suitable for a keepsake booklet.
`;
}