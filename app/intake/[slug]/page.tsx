import { notFound } from "next/navigation";
import IntakeSession from "./_components/IntakeSession";

const testSlugs = ["select-law-group", "demo"]

export default async function CustomPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    if (!testSlugs.includes(slug)) notFound()

    return <IntakeSession firm={slug} />
}