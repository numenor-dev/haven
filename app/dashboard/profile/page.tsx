import { auth } from '@/lib/auth/server'
import { client } from '@/lib/db/neon'
import Profile from '@/components/dashboard/Profile'

export default async function ProfilePage() {
    const { data: session } = await auth.getSession()
    if (!session) return null
    
    const { data: attorney } = await client
        .from('attorneys')
        .select('firm_id')
        .eq('neon_auth_user_id', session.user.id)
        .single()

    const { data: firm } = attorney
        ? await client
            .from('firms')
            .select('name')
            .eq('id', attorney.firm_id)
            .single()
        : { data: null }

    return (
        <Profile
            currentName={session.user.name ?? ''}
            currentFirm={firm?.name ?? ''}
        />
    )
}