'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  
  const isHomePage = pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const navLinks = [
    { text: 'Browse Listings', href: '/listings' },
    { text: 'Post a Listing', href: '/listings/create' },
  ]

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHomePage
          ? 'bg-white shadow-sm' 
          : 'bg-[#00274C]/90 backdrop-blur-sm'
      }`}>
        <div className="container">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Text only for clarity */}
            <Link href="/" className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg ${
                scrolled || !isHomePage 
                  ? 'bg-[#FFCB05] text-[#00274C]' 
                  : 'bg-[#FFCB05] text-[#00274C]'
              }`}>
                M
              </div>
              <span className="font-bold text-xl tracking-tight">
                <span className={scrolled || !isHomePage ? 'text-[#00274C]' : 'text-white'}>Maize</span>
                <span className="text-[#FFCB05]">Lease</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    scrolled || !isHomePage
                      ? 'text-gray-600 hover:text-[#00274C]'
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  {link.text}
                </Link>
              ))}
            </nav>

            {/* Auth */}
            <div className="hidden md:flex items-center gap-4">
              {status === 'loading' ? (
                <div className="w-20 h-9 bg-gray-200 rounded-lg animate-pulse" />
              ) : session ? (
                <div className="flex items-center gap-4">
                  <Link 
                    href="/dashboard"
                    className={`text-sm font-medium ${
                      scrolled || !isHomePage ? 'text-gray-600 hover:text-[#00274C]' : 'text-white/90 hover:text-white'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className={`text-sm font-medium ${
                      scrolled || !isHomePage ? 'text-gray-500 hover:text-gray-700' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className={`text-sm font-medium ${
                      scrolled || !isHomePage ? 'text-gray-600 hover:text-[#00274C]' : 'text-white/90 hover:text-white'
                    }`}
                  >
                    Log In
                  </Link>
                  <Link 
                    href="/register" 
                    className="px-4 py-2 bg-[#FFCB05] text-[#00274C] text-sm font-semibold rounded-lg hover:bg-[#e6b800] transition-colors"
                  >
                    Sign Up Free
                  </Link>
                </>
              )}
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg ${
                scrolled || !isHomePage ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/10'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <nav className="container py-4 space-y-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                >
                  {link.text}
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-gray-100 space-y-1">
                {session ? (
                  <>
                    <Link href="/dashboard" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">Dashboard</Link>
                    <button onClick={() => signOut()} className="block w-full text-left px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-lg">Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">Log In</Link>
                    <Link href="/register" className="block px-4 py-3 bg-[#FFCB05] text-[#00274C] text-center font-semibold rounded-lg mt-2">Sign Up Free</Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  )
}
