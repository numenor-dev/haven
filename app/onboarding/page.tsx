import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { getFirmIdForUser } from "@/lib/dashboard";
import Onboarding from "@/components/onboarding/Onboarding";

export default async function OnboardingPage() {
    const { data: session } = await auth.getSession();
    if (!session?.user) redirect('/login');

    const firmId = await getFirmIdForUser(session.user.id);
    if (firmId) redirect('/dashboard');

    return <Onboarding />;
}