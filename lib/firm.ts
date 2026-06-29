import { db } from "./db/db";
import { cache } from "react";
import { firms } from "./db/schema";
import { eq } from "drizzle-orm";

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function isFirmNameAvailable(slug: string): Promise<boolean> {
  const existing = await db.query.firms.findFirst({ where: eq(firms.slug, slug) });
  return !existing;
}

export async function getFirmIdBySlug(slug: string): Promise<string | null> {
  const [firm] = await db.select({ id: firms.id }).from(firms).where(eq(firms.slug, slug));
  return firm?.id ?? null;
}

export const getFirmNameForUser = cache(async(id: string): Promise<string | null> => {
  const [firm] = await db.select({ firmName: firms.firmName }).from(firms).where(eq(firms.id, id));
  return firm?.firmName ?? null;
})