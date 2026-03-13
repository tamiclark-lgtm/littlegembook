export const THEMES = [
  "Garden Guardians",
  "Secret Door Adventures",
  "Last Kind Dragon",
  "Constellation Club",
  "Time Travelers Treehouse"
] as const;

export type Theme = (typeof THEMES)[number];

export type ChildDetails = {
  childName: string;
  age: string;
  favoriteAnimal: string;
  favoriteColor: string;
  dedication: string;
  theme: Theme;
};

export type StoryPage = {
  pageNumber: number;
  text: string;
};

export type StoryPayload = {
  title: string;
  dedicationPageText: string;
  pages: StoryPage[];
  moral: string;
};