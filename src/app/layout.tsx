import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavbarClient from "@/components/layout/NavbarClient";
import Footer from "@/components/layout/Footer";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://sappio.ai'),
  title: {
    default: "Sappio - Your AI Study Companion",
    template: "%s | Sappio"
  },
  description: "Upload once, learn everything. Transform your study materials into smart notes, flashcards, quizzes, and mind maps.",
  keywords: ["AI study tool", "flashcards", "study notes", "quiz generator", "mind maps", "spaced repetition", "exam prep"],
  authors: [{ name: "Sappio" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sappio.ai",
    siteName: "Sappio",
    title: "Sappio - Your AI Study Companion",
    description: "Upload once, learn everything. Transform your study materials into smart notes, flashcards, quizzes, and mind maps.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sappio - AI Study Companion"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Sappio - Your AI Study Companion",
    description: "Upload once, learn everything. Transform your study materials into smart notes, flashcards, quizzes, and mind maps.",
    images: ["/og-image.png"],
    creator: "@sappio_ai"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased flex flex-col min-h-screen bg-[#F8FAFB] text-[#1A1D2E]`}
      >
        <NavbarClient />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
