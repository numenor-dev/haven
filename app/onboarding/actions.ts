'use server';

import { auth } from "@/lib/auth/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db/db";
import { firms, attorneys } from "@/lib/db/schema";
import { slugify, isFirmNameAvailable } from "@/lib/firm";
import { redirect } from "next/navigation";

export async function checkSlugAvailability(firmName: string) {
    const slug = slugify(firmName);
    const available = await isFirmNameAvailable(slug);
    return { slug, available };
}

export async function createFirm(
    _prevState: { error: string } | null,
    formData: FormData
) {
    const { data: session } = await auth.getSession();
    if (!session?.user) redirect('/auth/sign-in');

    const firmName = formData.get('firmName') as string;
    if (!firmName?.trim()) return { error: "Firm name is required." };

    const slug = slugify(firmName);
    if (!(await isFirmNameAvailable(slug))) {
        return { error: `"${slug}" is already taken — try a more specific name.` };
    }

    const firmId = randomUUID();

    try {
        await db.batch([
            db.insert(firms).values({
                id: firmId,
                name: firmName,
                slug,
                notificationEmail: session.user.email,
            }),
            db.insert(attorneys).values({
                neonAuthUserId: session.user.id,
                firmId,
            }),
        ]);
    } catch {
        return { error: `"${slug}" was just taken — try a more specific name.` };
    }

    redirect('/dashboard');
}