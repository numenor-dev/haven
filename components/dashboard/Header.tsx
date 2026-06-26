import { ThemeToggle } from "@/components/ui/themetoggle";
import Account from "../dashboard/Account";

export default function Header() {

    return (
        <header>
            <div className="absolute right-20 top-5">
                <Account />
            </div>
            <div>
                <ThemeToggle />
            </div>
        </header>
    );
}