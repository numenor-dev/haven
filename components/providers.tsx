'use client';

import { ThemeProvider } from "next-themes";
import { Toaster } from "./ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster
                position="top-center"
                toastOptions={{
                    classNames: {
                        title: "font-medium",
                    }
                }}
            />
        </ThemeProvider>
    );
}