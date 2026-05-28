import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: "Haven",
  description: "Intelligent client intake for attorneys.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("antialiased", inter.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full font-inter flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
