import { NextRequest, NextResponse } from "next/server";
import DATA from "../../../../negations.json";

type Category = {
  name: string;
  keywords: string[];
  intro: string[];
  reasons: string[];
  consequences: string[];
  finale: string[];
};

type NegationsData = {
  categories: Category[];
  fallback: Omit<Category, "keywords"> & { name: string };
};

const { categories, fallback } = DATA as NegationsData;

function normalize(text: string): Set<string> {
  const lowered = text.toLowerCase();
  const cleaned = lowered.replace(/[^\w\s]/g, " ");
  return new Set(cleaned.split(/\s+/).filter(Boolean));
}

function pickReason(idea: string): { message: string; category: string } {
  const words = normalize(idea);

  const matched: { score: number; category: Category }[] = [];
  for (const category of categories) {
    const score = category.keywords.reduce(
      (acc, kw) => acc + (words.has(kw.toLowerCase()) ? 1 : 0),
      0,
    );
    if (score > 0) matched.push({ score, category });
  }

  const category =
    matched.length > 0
      ? matched.sort((a, b) => b.score - a.score)[0].category
      : (fallback as Category);

  const random = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const message = ["intro", "reasons", "consequences", "finale"]
    .map((slot) => random(category[slot as keyof Category] as string[]))
    .join(" ");

  return { message, category: category.name };
}

export async function POST(request: NextRequest) {
  let idea = "";
  try {
    const body = (await request.json()) as { idea?: string };
    idea = body.idea?.trim() ?? "";
  } catch {
    idea = "";
  }

  const { message, category } = pickReason(idea);
  return NextResponse.json(
    { message, idea: idea || "ничего", category },
    { status: 200 },
  );
}
