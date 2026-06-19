'use server';

import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { firms, attorneys } from "@/lib/db/schema";
import { slugify, isSlugAvailable } from "@/lib/firm";
import { redirect } from "next/navigation";

export async function createFirm(
    _prevState: { error: string } | null,
    formData: FormData
) {
    const { data: session } = await auth.getSession();
    if (!session?.user) redirect('/auth/sign-in');

    const firmName = formData.get('firmName') as string;
    if (!firmName?.trim()) return { error: "Firm name is required." };

    const slug = slugify(firmName);
    if (!(await isSlugAvailable(slug))) {
        return { error: `"${slug}" is already taken — try a more specific name.` };
    }

    await db.transaction(async (tx) => {
        const [firm] = await tx.insert(firms).values({
            name: firmName,
            slug,
            notificationEmail: session.user.email,
        }).returning();

        await tx.insert(attorneys).values({
            neonAuthUserId: session.user.id,
            firmId: firm.id,
        });
    });

    redirect('/dashboard');
}