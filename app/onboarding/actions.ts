'use server';

import { auth } from "@/lib/auth/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db/db";
import { firms, attorneys } from "@/lib/db/schema";
import { slugify, isFirmNameAvailable } from "@/lib/firm";
import { redirect } from "next/navigation";
import { z } from "zod";

const OnboardingSchema = z.object({
    firmName: z.string()
        .min(2, { message: "Firm name must be at least 2 characters." })
        .max(50, { message: "Firm name cannot exceed 50 characters." })
});

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
    if (!session?.user) redirect('/login');

    const result = OnboardingSchema.safeParse({
        firmName: formData.get('firmName'),
    });

    if (!result.success) {
        return { error: result.error.issues[0].message };
    }

    const { firmName } = result.data;

    const slug = slugify(firmName);
    if (!(await isFirmNameAvailable(slug))) {
        return { error: `"${slug}" is already taken. Please try a more specific name.` };
    }

    const firmId = randomUUID();

    try {
        await db.batch([
            db.insert(firms).values({
                id: firmId,
                firmName: firmName,
                slug,
                notificationEmail: session.user.email,
            }),
            db.insert(attorneys).values({
                neonAuthUserId: session.user.id,
                firmId,
            }),
        ]);
    } catch (err) {
        const isUniqueViolation =
            err instanceof Error && err.message.includes('unique constraint');
        if (isUniqueViolation) {
            return { error: `"${slug}" is already taken. Please try a more specific name.` };
        }
        return { error: 'Something went wrong creating your firm. Please try again.' };
    }

    redirect('/dashboard');
}