import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "MaizeLease | UMich Student Housing & Subleases",
  description: "The trusted housing platform for University of Michigan students and Ann Arbor landlords. Find verified subleases, rentals, and roommates with academic term filters.",
  keywords: ["UMich housing", "Ann Arbor apartments", "student housing", "sublease", "University of Michigan", "MaizeLease", "Michigan housing", "college sublease"],
  authors: [{ name: "MaizeLease" }],
  openGraph: {
    title: "MaizeLease | Housing Built for Michigan Students",
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
            <footer className="border-t border-neutral-200 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {/* Brand */}
                  <div className="col-span-2 md:col-span-1">
                    <Link href="/" className="inline-block mb-4">
                      <Image
                        src="/logo.png"
                        alt="MaizeLease"
                        width={120}
                        height={40}
                        className="h-10 w-auto"
                      />
                    </Link>
                    <p className="text-sm text-neutral-500 leading-relaxed">
                      Housing built for Michigan students. Verified listings, academic-term leases, zero chaos.
                    </p>
                  </div>
                  
                  {/* Browse */}
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-4">Browse</h4>
                    <ul className="space-y-2">
                      <li><Link href="/listings" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">All Listings</Link></li>
                      <li><Link href="/listings?termTags=FALL" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Fall Subleases</Link></li>
                      <li><Link href="/listings?termTags=WINTER" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Winter Subleases</Link></li>
                      <li><Link href="/listings?termTags=SUMMER" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Summer Subleases</Link></li>
                    </ul>
                  </div>
                  
                  {/* Resources */}
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-4">Resources</h4>
                    <ul className="space-y-2">
                      <li><Link href="/#how" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">How It Works</Link></li>
                      <li><Link href="/#faq" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">FAQ</Link></li>
                      <li><Link href="/sublease-packet" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Sublease Packet</Link></li>
                      <li><Link href="/contact" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Contact</Link></li>
                    </ul>
                  </div>
                  
                  {/* Legal */}
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-4">Legal</h4>
                    <ul className="space-y-2">
                      <li><Link href="/terms" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Terms of Service</Link></li>
                      <li><Link href="/privacy" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Privacy Policy</Link></li>
                    </ul>
                  </div>
                </div>
                
                {/* Bottom bar */}
                <div className="mt-12 pt-8 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-neutral-400">
                    © {new Date().getFullYear()} MaizeLease. Built for the UMich community.
                  </p>
                  <div className="flex items-center gap-6">
                    <Link href="/register" className="text-sm font-medium text-[#00274C] hover:text-[#1E3A5F] transition-colors">
                      Get Started
                    </Link>
                    <Link href="/listings" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
                      Browse Listings
                    </Link>
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
