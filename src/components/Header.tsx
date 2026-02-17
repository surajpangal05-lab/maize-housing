'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const router = useRouter()
  
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/listings?q=${encodeURIComponent(searchQuery)}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const navLinks = [
    { text: 'Home', href: '/' },
    { text: 'Browse Listings', href: '/listings' },
    { text: 'Post a Listing', href: '/listings/create' },
    { text: 'Resources', href: '/#resources' },
    { text: 'FAQ', href: '/#faq' },
    { text: 'Contact', href: '/contact' },
  ]

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'glass shadow-lg py-2' 
          : 'bg-transparent py-4'
      }`}>
        <div className="container">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
              <div className="relative">
                <Image 
                  src="/logo.png" 
                  alt="MaizeLease" 
                  width={160} 
                  height={50}
                  className="h-10 w-auto transition-transform group-hover:scale-105"
                  priority
                />
              </div>
            </Link>

            {/* Center Navigation - Desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    pathname === link.href 
                      ? 'text-[#00274C] bg-[#FFCB05]/20' 
                      : scrolled || !isHomePage
                        ? 'text-[#333] hover:text-[#00274C] hover:bg-gray-100'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.text}
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Search Button */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2.5 rounded-lg transition-all ${
                  scrolled || !isHomePage
                    ? 'text-gray-600 hover:bg-gray-100'
                    : 'text-white/90 hover:bg-white/10'
                }`}
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Auth Buttons */}
              {status === 'loading' ? (
                <div className="w-20 h-10 bg-gray-200 rounded-lg animate-pulse" />
              ) : session ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link 
                    href="/dashboard"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      scrolled || !isHomePage
                        ? 'hover:bg-gray-100'
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FFCB05] flex items-center justify-center">
                      <span className="text-[#00274C] text-sm font-bold">
                        {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${
                      scrolled || !isHomePage ? 'text-gray-700' : 'text-white'
                    }`}>
                      {session.user?.name?.split(' ')[0] || 'Account'}
                    </span>
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                      scrolled || !isHomePage
                        ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link 
                    href="/login" 
                    className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all border-2 ${
                      scrolled || !isHomePage
                        ? 'border-[#FFCB05] text-[#00274C] hover:bg-[#FFCB05] hover:text-[#00274C]'
                        : 'border-white/50 text-white hover:bg-white hover:text-[#00274C]'
                    }`}
                  >
                    Log In
                  </Link>
                  <Link 
                    href="/register" 
                    className="btn btn-secondary"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden p-2.5 rounded-lg transition-colors ${
                  scrolled || !isHomePage
                    ? 'text-gray-600 hover:bg-gray-100'
                    : 'text-white hover:bg-white/10'
                }`}
                aria-label="Menu"
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
        </div>

        {/* Search Dropdown */}
        {searchOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-100 animate-fade-in-down">
            <div className="container py-4">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="flex-1 relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search listings by location, term, or keyword..."
                    className="input pl-12"
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Search
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-100 animate-fade-in-down">
            <nav className="container py-4 space-y-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    pathname === link.href 
                      ? 'text-[#00274C] bg-[#FFCB05]/20' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.text}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-gray-100 mt-4 space-y-2">
                {session ? (
                  <>
                    <Link 
                      href="/dashboard"
                      className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => { signOut({ callbackUrl: '/' }); setMobileMenuOpen(false); }}
                      className="block w-full text-left px-4 py-3 text-base font-medium text-gray-500 hover:bg-gray-100 rounded-lg"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login"
                      className="block w-full text-center py-3 text-base font-semibold border-2 border-[#FFCB05] text-[#00274C] rounded-lg hover:bg-[#FFCB05]/10"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Log In
                    </Link>
                    <Link 
                      href="/register"
                      className="block w-full text-center py-3 text-base font-semibold bg-[#00274C] text-white rounded-lg hover:bg-[#1E3A5F]"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Spacer for fixed header */}
      <div className={isHomePage ? '' : 'h-20'} />
    </>
  )
}
