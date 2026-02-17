'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { homeContent } from '@/content/home'

export default function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  
  const isHomePage = pathname === '/'
  const { navigation } = homeContent

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-lg border-b border-neutral-200 shadow-sm' 
          : 'bg-white/80 backdrop-blur-lg border-b border-neutral-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <Image 
                src="/logo.png" 
                alt="MaizeLease" 
                width={194} 
                height={72}
                className="h-14 w-auto"
                priority
              />
            </Link>

            {/* Center Navigation - Marketing Links (only on home page) */}
            {isHomePage && (
              <nav className="hidden lg:flex items-center gap-1">
                {navigation.links.map((link) => (
                  <a 
                    key={link.href}
                    href={link.href}
                    className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-[#00274C] rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    {link.text}
                  </a>
                ))}
              </nav>
            )}

            {/* Desktop Navigation - App Links (when logged in or not on home page) */}
            {!isHomePage && (
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
            )}

            {/* Right Section - CTAs and Auth */}
            <div className="flex items-center gap-3">
              {/* CTA Buttons (visible on home page for non-logged in users) */}
              {isHomePage && !session && status !== 'loading' && (
                <div className="hidden md:flex items-center gap-2">
                  <Link 
                    href="/listings" 
                    className="px-4 py-2 text-sm font-semibold text-[#00274C] hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    Browse Listings
                  </Link>
                  <Link 
                    href="/register" 
                    className="px-4 py-2 text-sm font-semibold bg-[#FFCB05] text-[#00274C] hover:bg-[#FFD84D] rounded-lg transition-colors"
                  >
                    Post a Listing
                  </Link>
                </div>
              )}

              {status === 'loading' ? (
                <div className="w-24 h-9 bg-neutral-100 rounded-lg animate-pulse" />
              ) : session ? (
                <div className="flex items-center gap-3">
                  {/* Quick action buttons when logged in */}
                  {isHomePage && (
                    <div className="hidden md:flex items-center gap-2">
                      <Link 
                        href="/listings" 
                        className="px-4 py-2 text-sm font-semibold text-[#00274C] hover:bg-neutral-100 rounded-lg transition-colors"
                      >
                        Browse
                      </Link>
                      <Link 
                        href="/listings/create" 
                        className="px-4 py-2 text-sm font-semibold bg-[#FFCB05] text-[#00274C] hover:bg-[#FFD84D] rounded-lg transition-colors"
                      >
                        Post Listing
                      </Link>
                    </div>
                  )}
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
                <div className="hidden md:flex items-center gap-2">
                  <Link 
                    href="/login" 
                    className="text-sm font-medium text-neutral-600 hover:text-[#00274C] transition-colors px-3 py-2"
                  >
                    Sign In
                  </Link>
                </div>
              )}
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
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

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white">
            <nav className="px-4 py-3 space-y-1">
              {/* Marketing links on home page */}
              {isHomePage && (
                <>
                  {navigation.links.map((link) => (
                    <a 
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-[#00274C] rounded-lg hover:bg-neutral-100 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.text}
                    </a>
                  ))}
                  <div className="my-2 border-t border-neutral-100" />
                </>
              )}
              
              <Link 
                href="/listings" 
                className="block px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-[#00274C] rounded-lg hover:bg-neutral-100 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Listings
              </Link>
              {session ? (
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
              ) : (
                <>
                  <div className="my-2 border-t border-neutral-100" />
                  <Link 
                    href="/login" 
                    className="block px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-[#00274C] rounded-lg hover:bg-neutral-100 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/register" 
                    className="block px-4 py-2.5 text-sm font-semibold text-[#00274C] bg-[#FFCB05] rounded-lg hover:bg-[#FFD84D] transition-colors text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Mobile Bottom Fixed CTA Bar (only on home page for non-logged in users) */}
      {isHomePage && !session && status !== 'loading' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-neutral-200 p-3 shadow-lg">
          <div className="flex gap-3">
            <Link 
              href="/listings" 
              className="flex-1 py-3 text-sm font-semibold text-center text-[#00274C] bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              Browse
            </Link>
            <Link 
              href="/register" 
              className="flex-1 py-3 text-sm font-semibold text-center text-[#00274C] bg-[#FFCB05] hover:bg-[#FFD84D] rounded-lg transition-colors"
            >
              Post Listing
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
