'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b border-neutral-200 bg-white sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="MaizeLease"
              width={28}
              height={28}
              className="h-7 w-7"
              priority
            />
            <span className="font-semibold text-neutral-900">MaizeLease</span>
          </Link>
          
          {/* Nav Links - Center */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/listings" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
              Browse
            </Link>
            <Link href="/listings/create" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
              Post
            </Link>
            <Link href="/#how-it-works" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
              How It Works
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {status === 'loading' ? (
              <div className="w-20 h-8 bg-neutral-100 animate-pulse" />
            ) : session ? (
              <div className="hidden md:flex items-center gap-4">
                <Link 
                  href="/messages" 
                  className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Messages
                </Link>
                <Link 
                  href="/profile" 
                  className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="hidden md:block text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors"
              >
                Log In
              </Link>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -mr-2"
              aria-label="Menu"
            >
              <svg className="w-5 h-5 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <nav className="max-w-4xl mx-auto px-6 py-4 space-y-4">
            <Link 
              href="/listings" 
              className="block text-sm text-neutral-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse
            </Link>
            <Link 
              href="/listings/create" 
              className="block text-sm text-neutral-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              Post
            </Link>
            <Link 
              href="/#how-it-works" 
              className="block text-sm text-neutral-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <div className="border-t border-neutral-200 pt-4">
              {session ? (
                <>
                  <Link 
                    href="/messages" 
                    className="block text-sm text-neutral-600 mb-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Messages
                  </Link>
                  <Link 
                    href="/profile" 
                    className="block text-sm text-neutral-600 mb-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut({ callbackUrl: '/' })
                    }}
                    className="block text-sm text-neutral-400"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link 
                  href="/login" 
                  className="block text-sm font-medium text-neutral-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* Mobile Sticky CTAs */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50 px-4 py-3 flex gap-3">
        <Link 
          href="/listings"
          className="flex-1 py-3 bg-neutral-900 text-white text-sm font-medium text-center"
        >
          Browse
        </Link>
        <Link 
          href="/listings/create"
          className="flex-1 py-3 border border-neutral-900 text-neutral-900 text-sm font-medium text-center"
        >
          Post
        </Link>
      </div>
    </header>
  )
}
