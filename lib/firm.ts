import { db } from "@/lib/db";
import { firms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function isSlugAvailable(slug: string): Promise<boolean> {
  const existing = await db.query.firms.findFirst({ where: eq(firms.slug, slug) });
  return !existing;
}