import type { Metadata } from "next";
import { Inter } from "next/font/google"
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/app/providers";
import Script from 'next/script'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Course Alerts | Get into any full class at Ontario Tech University",
  description: "Classes full? Get notified as soon as a spot opens up.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <Providers>
          {children}
        </Providers>
        <Toaster />
        <Script src="/made-with-love.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
