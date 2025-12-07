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
    default: "Sappio - Turn Your Notes Into Perfect Study Packs",
    template: "%s | Sappio"
  },
  description: "Upload any PDF or slide deck. We'll generate exam-ready flashcards, quizzes, and mind maps in seconds. AI-powered study companion for students.",
  keywords: ["AI study tool", "flashcards", "study notes", "quiz generator", "mind maps", "spaced repetition", "exam prep"],
  authors: [{ name: "Sappio" }],
  verification: {
    google: "YOUR_VERIFICATION_CODE", // Replace with your Google Search Console verification code
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sappio.ai",
    siteName: "Sappio",
    title: "Sappio - Turn Your Notes Into Perfect Study Packs",
    description: "Upload any PDF or slide deck. We'll generate exam-ready flashcards, quizzes, and mind maps in seconds. AI-powered study companion for students.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sappio - Turn Your Notes Into Perfect Study Packs"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Sappio - Turn Your Notes Into Perfect Study Packs",
    description: "Upload any PDF or slide deck. We'll generate exam-ready flashcards, quizzes, and mind maps in seconds. AI-powered study companion for students.",
    images: ["https://sappio.ai/og-image.png"],
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
