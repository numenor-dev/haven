'use server';

import { auth } from '@/lib/auth/server'
import { db } from '@/lib/db/db'
import { eq } from 'drizzle-orm'
import { attorneys, firms } from '@/lib/db/schema'
import { slugify, isFirmNameAvailable } from '@/lib/firm';
import { revalidatePath } from 'next/cache';
import { UpdateNameState, UpdateFirmState } from '@/types/types';
import { z } from 'zod';

const SaveNameSchema = z.object({
    name:
        z.string()
            .trim()
            .min(1, { message: "Name must be at least 1 letter long." })
})

const SaveFirmSchema = z.object({
    firmName:
        z.string()
            .trim()
            .min(2, { message: "Firm name must be at least 2 characters." })
            .max(50, { message: "Firm name cannot exceed 50 characters." })
})

export async function updateName(
    _prevState: UpdateNameState,
    formData: FormData
): Promise<UpdateNameState> {

    const result = SaveNameSchema.safeParse({
        name: formData.get('name'),
    })

    if (!result.success) {
        return {
            error: result.error.issues[0].message
        };
    }

    const { name } = result.data;

    const { data: session } = await auth.getSession();
    if (!session) return { error: 'Not authenticated' }

    const { error } = await auth.updateUser({ name })
    if (error) return { error: 'An error occurred while updating your name. Please try again.' }

    revalidatePath('/dashboard/profile')
    return { success: true }
}

export async function updateFirmName(
    _prevState: UpdateFirmState,
    formData: FormData
): Promise<UpdateFirmState> {

    const result = SaveFirmSchema.safeParse({
        firmName: formData.get('firm'),
    })

    if (!result.success) {
        return {
            error: result.error.issues[0].message
        };
    }

    const { firmName } = result.data;

    const { data: session } = await auth.getSession();
    if (!session) return { error: 'Not authenticated' }

    const slug = slugify(firmName);
    if (!(await isFirmNameAvailable(slug))) {
        return { error: `"${firmName}" is already taken. Please try a more specific name.` };
    }

    const attorney = await db
        .select({ firmId: attorneys.firmId })
        .from(attorneys)
        .where(eq(attorneys.neonAuthUserId, session.user.id))
        .limit(1)
        .then(rows => rows[0] ?? null)

    if (!attorney) return { error: 'Account not found.' }

    const [updated] = await db
        .update(firms)
        .set({ firmName: firmName, slug: slug })
        .where(eq(firms.id, attorney.firmId))
        .returning()

    if (!updated) return { error: 'No account found.' }

    revalidatePath('/dashboard/profile')
    return { success: true }
}