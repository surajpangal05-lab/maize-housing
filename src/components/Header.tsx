'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="max-w-5xl mx-auto px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="MaizeLease"
                width={100}
                height={33}
                className="h-6 w-auto grayscale"
                priority
              />
            </Link>
            
            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/listings" className="text-xs text-neutral-600 hover:text-neutral-900 tracking-wider">
                Browse
              </Link>
              <Link href="/listings" className="text-xs text-neutral-600 hover:text-neutral-900 tracking-wider">
                Search
              </Link>
              <Link href="/listings/create" className="text-xs text-neutral-600 hover:text-neutral-900 tracking-wider">
                Post Sublease
              </Link>
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-neutral-100 animate-pulse" />
            ) : session ? (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/messages" className="w-8 h-8 border border-neutral-900 flex items-center justify-center hover:bg-neutral-100 transition-colors">
                  <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </Link>
                <Link href="/profile" className="w-8 h-8 border border-neutral-900 flex items-center justify-center hover:bg-neutral-100 transition-colors">
                  <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-xs text-neutral-400 hover:text-neutral-600 tracking-wider"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/messages" className="w-8 h-8 border border-neutral-900 flex items-center justify-center hover:bg-neutral-100 transition-colors">
                  <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </Link>
                <Link href="/login" className="w-8 h-8 border border-neutral-900 flex items-center justify-center hover:bg-neutral-100 transition-colors">
                  <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-8 h-8 border border-neutral-900 flex items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white">
          <nav className="max-w-5xl mx-auto px-8 py-4 space-y-3">
            <Link 
              href="/listings" 
              className="block text-xs text-neutral-600 hover:text-neutral-900 tracking-wider"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse
            </Link>
            <Link 
              href="/listings" 
              className="block text-xs text-neutral-600 hover:text-neutral-900 tracking-wider"
              onClick={() => setMobileMenuOpen(false)}
            >
              Search
            </Link>
            <Link 
              href="/listings/create" 
              className="block text-xs text-neutral-600 hover:text-neutral-900 tracking-wider"
              onClick={() => setMobileMenuOpen(false)}
            >
              Post Sublease
            </Link>
            {session ? (
              <>
                <Link 
                  href="/messages" 
                  className="block text-xs text-neutral-600 hover:text-neutral-900 tracking-wider"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Messages
                </Link>
                <Link 
                  href="/profile" 
                  className="block text-xs text-neutral-600 hover:text-neutral-900 tracking-wider"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
              </>
            ) : (
              <Link 
                href="/login" 
                className="block text-xs text-neutral-600 hover:text-neutral-900 tracking-wider"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
