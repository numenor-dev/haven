import { ThemeToggle } from "@/components/ui/themetoggle";
import Link from "next/link";

const links = [
    {
        label: "Select Law Group",
        href: "https://www.selectlawgroup.com/",
        aria: "Select Law Group"
    },
    {
        label: "Personal Injury 101",
        href: "https://www.nolo.com/legal-encyclopedia/what-is-the-personal-injury-statute-of-limitations-in-washington.html",
        aria: "Personal Injury Statute of Limitations in Washington State"
    }
];


export default function Header() {

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            <div className="absolute inset-0 backdrop-blur-2xl" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-zinc-100/20" />

            {/* Nav links */}
            <div className="relative max-w-6xl mx-auto px-6 h-16 flex items-center">
                <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                    {links.map((link) => (
                        <div
                            key={link.href}
                        >
                            <Link
                                href={link.href}
                                className="text-base text-foreground px-3 py-1.5 rounded-lg hover:bg-foreground/20 hover:dark:bg-sky-900 transition-all duration-200"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={link.aria}
                            >
                                {link.label}
                            </Link>
                        </div>
                    ))}
                </nav>
                <div className="hidden md:flex items-center gap-2 ml-auto">
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}