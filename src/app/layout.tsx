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
              <div className="max-w-5xl mx-auto px-8 py-4">
                <div className="flex items-center justify-between">
                  <Link href="/">
                    <Image
                      src="/logo.png"
                      alt="MaizeLease"
                      width={80}
                      height={27}
                      className="h-5 w-auto grayscale opacity-60 hover:opacity-100 transition-opacity"
                    />
                  </Link>
                  <div className="flex items-center gap-6">
                    <Link href="/listings" className="text-xs text-neutral-500 hover:text-neutral-900 tracking-wider">Browse</Link>
                    <Link href="/contact" className="text-xs text-neutral-500 hover:text-neutral-900 tracking-wider">Contact</Link>
                    <a href="#" className="text-xs text-neutral-500 hover:text-neutral-900 tracking-wider">Terms</a>
                  </div>
                  <p className="text-xs text-neutral-400">© 2026</p>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
