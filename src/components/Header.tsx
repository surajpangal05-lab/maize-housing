'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="MaizeLease" 
              width={194} 
              height={72}
              className="h-14 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link 
              href="/listings" 
              className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-[#00274C] rounded-lg hover:bg-neutral-100 transition-colors"
            >
              Browse Listings
            </Link>
            {session && (
              <>
                <Link 
                  href="/listings/create" 
                  className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-[#00274C] rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  Post Listing
                </Link>
                <Link 
                  href="/dashboard" 
                  className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-[#00274C] rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/messages" 
                  className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-[#00274C] rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  Messages
                </Link>
              </>
            )}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {status === 'loading' ? (
              <div className="w-24 h-9 bg-neutral-100 rounded-lg animate-pulse" />
            ) : session ? (
              <div className="flex items-center gap-3">
                <Link 
                  href="/profile"
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[#FFCB05] flex items-center justify-center">
                    <span className="text-[#00274C] text-sm font-semibold">
                      {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-neutral-700">
                    {session.user?.name?.split(' ')[0] || 'Account'}
                  </span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-neutral-600 hover:text-[#00274C] transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="btn btn-primary text-sm"
                >
                  Get Started
                </Link>
              </>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white">
          <nav className="px-4 py-3 space-y-1">
            <Link 
              href="/listings" 
              className="block px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-[#00274C] rounded-lg hover:bg-neutral-100 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Listings
            </Link>
            {session && (
              <>
                <Link 
                  href="/listings/create" 
                  className="block px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-[#00274C] rounded-lg hover:bg-neutral-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Post Listing
                </Link>
                <Link 
                  href="/dashboard" 
                  className="block px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-[#00274C] rounded-lg hover:bg-neutral-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/messages" 
                  className="block px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-[#00274C] rounded-lg hover:bg-neutral-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Messages
                </Link>
                <Link 
                  href="/profile" 
                  className="block px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-[#00274C] rounded-lg hover:bg-neutral-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
