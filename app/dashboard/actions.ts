'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth/server';
import { getFirmIdForUser, updateChatRecordsStatus } from '@/lib/dashboard';
import { AppError } from '@/lib/errors';
import { ChatRecordsStatus, ActionResult } from '@/types/types';

export async function updateRecordStatus(recordId: string, status: ChatRecordsStatus): Promise<ActionResult> {

    try {
        const { data: session } = await auth.getSession();
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' };
        }

        const firmId = await getFirmIdForUser(session.user.id);
        if (!firmId) {
            return { success: false, error: 'Firm not found' };
        }

        const updated = await updateChatRecordsStatus(recordId, firmId, status);
        if (!updated) {
            return { success: false, error: 'Record not found' };
        }

        revalidatePath('/dashboard');
        return { success: true };
    } catch (err) {
        console.error('[updateRecordStatus]', err);
        return {
            success: false,
            error: err instanceof AppError ? err.message : 'Failed to update status',
        };
    }
}