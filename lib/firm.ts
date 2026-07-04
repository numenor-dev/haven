import { db } from "./db/db";
import { cache } from "react";
import { firms, attorneys } from "./db/schema";
import { eq } from "drizzle-orm";
import { FirmSummary } from "@/types/types";
import { FirmNotFoundError } from "./errors";

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

export async function getFirmBySlug(slug: string): Promise<FirmSummary | null> {
  const [firm] = await db
    .select({ id: firms.id, firmName: firms.firmName })
    .from(firms)
    .where(eq(firms.slug, slug));
  return firm ?? null;
}


export const getFirmDataForUser = cache(async (userId: string): Promise<{
    id: string;
    name: string;
    slug: string;
    isTrialExhausted: boolean;
}> => {
    const [firm] = await db
        .select({
            id: firms.id,
            name: firms.firmName,
            slug: firms.slug,
            isTrialExhausted: attorneys.isTrialExhausted,
        })
        .from(firms)
        .innerJoin(attorneys, eq(attorneys.firmId, firms.id))
        .where(eq(attorneys.neonAuthUserId, userId));
    if (!firm) throw new FirmNotFoundError(userId);
    return firm;
});