import type { Metadata } from "next";
import { Inter, Inter_Tight, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
import { SmoothScroll } from "@/components/SmoothScroll";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Auren | AI Voice Tutor",
  description: "Real-time AI voice-to-voice language tutor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html
        lang="en"
        className={`${inter.variable} ${interTight.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
            <SmoothScroll>{children}</SmoothScroll>
        </body>
      </html>
    </AuthProvider>
  );
}
