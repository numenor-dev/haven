import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers"
import { GoogleAnalytics } from '@next/third-parties/google'


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: "Haven",
  description: "Intelligent client onboarding for attorneys.",
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
      <GoogleAnalytics gaId={process.env.GA_ID!} />
      <body className="min-h-full font-inter flex flex-col" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
