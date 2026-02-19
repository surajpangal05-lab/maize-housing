import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "MaizeLease | UMich Student Housing & Subleases",
  description: "The trusted housing platform for University of Michigan students and Ann Arbor landlords. Find verified subleases, rentals, and roommates with academic term filters.",
  keywords: ["UMich housing", "Ann Arbor apartments", "student housing", "sublease", "University of Michigan", "MaizeLease", "Michigan housing", "college sublease"],
  authors: [{ name: "MaizeLease" }],
  openGraph: {
    title: "MaizeLease | Find Your Perfect UMich Home",
    description: "Verified listings. Academic-term leases. Zero chaos. The only housing platform designed specifically for UMich students and Ann Arbor landlords.",
    url: "https://maizelease.com",
    siteName: "MaizeLease",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "MaizeLease | UMich Student Housing",
    description: "Verified listings. Academic-term leases. Find your next Ann Arbor place with confidence.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
