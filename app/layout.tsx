import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";


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
          <Toaster
            position="top-center"
            toastOptions={{
              classNames: {
                toast: "!w-[350px] md:!w-[400px]",
                title: "md:text-base font-medium"
              }
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
