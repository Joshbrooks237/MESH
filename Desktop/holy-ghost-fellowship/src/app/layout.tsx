import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Church } from "lucide-react";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Holy Ghost Fellowship - Global Christian Community",
  description: "Connect with Christians worldwide for prayer, fellowship, Bible study, and spiritual growth. Join our global community of believers.",
  keywords: ["Christian", "fellowship", "prayer", "Bible study", "church", "community", "faith"],
  authors: [{ name: "Holy Ghost Fellowship" }],
  openGraph: {
    title: "Holy Ghost Fellowship",
    description: "Global Christian community for prayer and fellowship",
    type: "website",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Simple Navigation Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                  <Church className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg text-gray-900">Holy Ghost Fellowship</span>
              </Link>

              <nav className="flex space-x-6">
                <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Home
                </Link>
                <Link href="/church-finder" className="text-gray-700 hover:text-purple-600 transition-colors flex items-center">
                  <Church className="w-4 h-4 mr-1" />
                  Find Church
                </Link>
                <Link href="/auth/signin" className="text-gray-700 hover:text-green-600 transition-colors">
                  Sign In
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}