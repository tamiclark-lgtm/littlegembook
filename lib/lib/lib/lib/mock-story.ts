import { ChildDetails, StoryPayload } from "@/lib/types";

export function buildMockStory(input: ChildDetails): StoryPayload {
  const title = `${input.childName} and the ${input.favoriteColor} ${input.favoriteAnimal}`;

  return {
    title,
    dedicationPageText: `A Little Gem Book for ${input.childName}. ${input.dedication}`,
    pages: Array.from({ length: 8 }).map((_, idx) => ({
      pageNumber: idx + 3,
      text: `${input.childName} stepped into the ${input.theme} quest and discovered that courage grows when you help others. On this part of the journey, ${input.childName} followed a ${input.favoriteColor} clue left by a kind ${input.favoriteAnimal}.`
    })),
    moral: `${input.childName} learned that kindness, curiosity, and teamwork can turn small moments into big adventures.`
  };
}