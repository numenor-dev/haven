import { auth } from '@/lib/auth/server'
import { db } from '@/lib/db/db'
import { attorneys, firms } from '@/lib/db/schema'
import { sql, eq } from 'drizzle-orm'
import Profile from '@/components/dashboard/Profile'

export default async function ProfilePage() {
    const { data: session } = await auth.getSession()
    if (!session) return null

    const updatedName = await db.execute(
        sql`SELECT name FROM neon_auth.user WHERE id = ${session.user.id}`
    )

    const currentName = updatedName.rows[0]?.name as string ?? ''

    const attorney = await db
        .select({ firmId: attorneys.firmId })
        .from(attorneys)
        .where(eq(attorneys.neonAuthUserId, session.user.id))
        .limit(1)
        .then(rows => rows[0] ?? null)

    const firm = attorney
        ? await db
            .select({ firmName: firms.firmName })
            .from(firms)
            .where(eq(firms.id, attorney.firmId))
            .limit(1)
            .then(rows => rows[0] ?? null)
        : null

    return (
        <Profile
            currentName={currentName}
            currentFirm={firm?.firmName ?? ''}
        />
    )
}