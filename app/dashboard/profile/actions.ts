'use server';

import { auth } from '@/lib/auth/server'
import { client } from '@/lib/db/neon';
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
            .min(1, { message: "Firm name must be at least 1 letter long." })
})

export async function updateName(
    _prevState: { error: string } | { success: boolean } | null,
    formData: FormData
) {

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

    const { error } = await client
        .from('neon_auth.users_sync')
        .update({ name })
        .eq('id', session.user.id)
        .select()

    if (error) return { error: 'An error occurred while updating your name. Please try again.' }

    return { success: true }
}

export async function updateFirmName(
    _prevState: { error: string } | { success: boolean } | null,
    formData: FormData
) {

    const result = SaveFirmSchema.safeParse({
        firmName: formData.get('firm'),
    })

    if (!result.success) {
        return {
            error: result.error.issues[0].message
        };
    }

    const { firmName } = result.data

    const { data: session } = await auth.getSession()
    if (!session) return { error: 'Not authenticated' }

    const { data: attorney, error: attorneyError } = await client
        .from('attorneys')
        .select('firm_id')
        .eq('neon_auth_user_id', session.user.id)
        .single()

    if (attorneyError || !attorney) return { error: 'Attorney not found.' }

    const { error: firmError } = await client
        .from('firms')
        .update({ firm_name: firmName })
        .eq('id', attorney.firm_id)
        .select()

    if (firmError) return { error: 'An error occurred while updating the firm name. Please try again.' }
    return { success: true }
}