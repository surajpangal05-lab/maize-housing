'use client'

import Link from 'next/link'
import { homeContent } from '@/content/home'

export default function Hero() {
  const { hero } = homeContent

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-neutral-50 via-white to-amber-50/30">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#FFCB05]/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#00274C]/10 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-neutral-100 mb-8">
            <span className="w-2 h-2 bg-[#FFCB05] rounded-full animate-pulse" />
            <span className="text-sm font-medium text-neutral-600">Built for the UMich Community</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-neutral-900 leading-tight tracking-tight">
            Digital Treasures for{' '}
            <span className="bg-gradient-to-r from-[#00274C] to-[#1E3A5F] bg-clip-text text-transparent">Students</span>
          </h1>
          
          <p className="mt-6 text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Browse a rich collection of verified housing listings and subleases for your academic journey at Michigan.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={hero.primaryCTA.href}
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-full bg-[#00274C] text-white hover:bg-[#1E3A5F] transition-all shadow-lg shadow-[#00274C]/20 hover:shadow-xl hover:-translate-y-0.5"
            >
              {hero.primaryCTA.text}
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href={hero.secondaryCTA.href}
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-full bg-white text-neutral-900 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all"
            >
              {hero.secondaryCTA.text}
            </Link>
          </div>

          {/* Stats Row */}
          <div className="mt-16 flex flex-wrap justify-center gap-12 lg:gap-20">
            <div className="text-center">
              <p className="text-4xl lg:text-5xl font-bold text-[#00274C]">500+</p>
              <p className="mt-1 text-sm font-medium text-neutral-500">Verified Students</p>
            </div>
            <div className="text-center">
              <p className="text-4xl lg:text-5xl font-bold text-[#00274C]">200+</p>
              <p className="mt-1 text-sm font-medium text-neutral-500">Listings</p>
            </div>
            <div className="text-center">
              <p className="text-4xl lg:text-5xl font-bold text-[#00274C]">150+</p>
              <p className="mt-1 text-sm font-medium text-neutral-500">Successful Matches</p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-16 pt-12 border-t border-neutral-200">
            <p className="text-sm font-medium text-neutral-400 mb-6">Trusted verification features</p>
            <div className="flex flex-wrap justify-center gap-6 lg:gap-10">
              {hero.trustBadges.map((badge, index) => (
                <div key={index} className="flex items-center gap-2 text-neutral-600">
                  <div className="w-8 h-8 rounded-lg bg-[#FFCB05]/20 flex items-center justify-center">
                    <TrustIcon name={badge.icon} />
                  </div>
                  <span className="text-sm font-medium">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TrustIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    'shield-check': (
      <svg className="w-4 h-4 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    'building': (
      <svg className="w-4 h-4 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    'calendar': (
      <svg className="w-4 h-4 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    'file-text': (
      <svg className="w-4 h-4 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  }
  return icons[name] || null
}
