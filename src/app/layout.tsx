import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "MaizeLease | UMich Student Housing & Subleases",
  description: "The trusted housing platform for University of Michigan students and Ann Arbor landlords. Find verified subleases, rentals, and roommates.",
  keywords: ["UMich housing", "Ann Arbor apartments", "student housing", "sublease", "University of Michigan", "MaizeLease"],
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
            <footer className="border-t border-neutral-200 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <Link href="/" className="flex items-center">
                    <Image 
                      src="/logo.png" 
                      alt="MaizeLease" 
                      width={162} 
                      height={60}
                      className="h-12 w-auto"
                    />
                  </Link>
                  <p className="text-sm text-neutral-500">
                    © {new Date().getFullYear()} MaizeLease. Built for the UMich community.
                  </p>
                  <div className="flex gap-6">
                    <a href="#" className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors">Terms</a>
                    <a href="#" className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors">Privacy</a>
                    <Link href="/contact" className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors">Contact</Link>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
