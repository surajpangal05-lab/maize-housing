'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Header() {
  const { data: session, status } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <header className="bg-[#00274C] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="MaizeLease" width={32} height={32} className="w-8 h-8 object-contain" priority />
            <div className="text-left">
              <h1 className="text-2xl font-bold text-[#FFCB05] leading-none">MaizeLease</h1>
              <p className="text-xs text-blue-200">For Michigan Students Only</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/listings" className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              Browse Listings
            </Link>
            <Link href="/trust-safety" className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors font-medium">
              Trust & Safety
            </Link>

            {status === 'loading' ? (
              <div className="w-24 h-10 bg-white/10 rounded-lg animate-pulse" />
            ) : session ? (
              <>
                <Link href="/dashboard" className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors font-medium">
                  Dashboard
                </Link>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="px-4 py-2 text-blue-200 hover:bg-white/10 rounded-lg transition-colors">
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors font-medium">
                Log In
              </Link>
            )}

            <Link href="/listings/create" className="px-5 py-2.5 bg-[#FFCB05] text-[#00274C] hover:bg-[#FFD42E] rounded-lg transition-colors font-semibold flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Post Listing
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#00274C] border-t border-white/10 animate-fade-in">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            <Link href="/listings" className="block px-4 py-3 text-white hover:bg-white/10 rounded-lg font-medium">Browse Listings</Link>
            <Link href="/trust-safety" className="block px-4 py-3 text-white hover:bg-white/10 rounded-lg font-medium">Trust & Safety</Link>
            {session ? (
              <>
                <Link href="/dashboard" className="block px-4 py-3 text-white hover:bg-white/10 rounded-lg font-medium">Dashboard</Link>
                <button onClick={() => signOut()} className="block w-full text-left px-4 py-3 text-blue-200 hover:bg-white/10 rounded-lg">Sign Out</button>
              </>
            ) : (
              <Link href="/login" className="block px-4 py-3 text-white hover:bg-white/10 rounded-lg font-medium">Log In</Link>
            )}
            <Link href="/listings/create" className="block px-4 py-3 bg-[#FFCB05] text-[#00274C] text-center font-semibold rounded-lg mt-2">Post Listing</Link>
          </nav>
        </div>
      )}
    </header>
  )
}
