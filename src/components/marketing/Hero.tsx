'use client'

import Link from 'next/link'
import { homeContent } from '@/content/home'

export default function Hero() {
  const { hero } = homeContent

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#00274C] via-[#1E3A5F] to-[#00274C]">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFCB05' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              {hero.headline.split('Michigan').map((part, i) => (
                i === 0 ? (
                  <span key={i}>{part}<span className="text-[#FFCB05]">Michigan</span></span>
                ) : (
                  <span key={i}>{part}</span>
                )
              ))}
            </h1>
            
            <p className="mt-6 text-xl sm:text-2xl text-[#FFCB05] font-medium">
              {hero.subheadline}
            </p>
            
            <p className="mt-4 text-lg text-neutral-300 max-w-xl mx-auto lg:mx-0">
              {hero.description}
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href={hero.primaryCTA.href}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl bg-[#FFCB05] text-[#00274C] hover:bg-[#FFD84D] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {hero.primaryCTA.text}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href={hero.secondaryCTA.href}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl border-2 border-white/30 text-white hover:bg-white/10 transition-all"
              >
                {hero.secondaryCTA.text}
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {hero.trustBadges.map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm"
                >
                  <TrustIcon name={badge.icon} />
                  <span className="text-sm font-medium text-white">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual */}
          <div className="hidden lg:block relative">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Decorative elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFCB05]/20 to-transparent rounded-3xl transform rotate-3" />
              <div className="absolute inset-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl">
                <div className="p-6 h-full flex flex-col">
                  {/* Mock listing cards */}
                  <div className="flex-1 space-y-4">
                    <MockListingCard 
                      title="2BR near Central Campus"
                      price="$1,200"
                      badge="UM Student"
                      term="Fall 2025"
                    />
                    <MockListingCard 
                      title="Studio in Kerrytown"
                      price="$950"
                      badge="Landlord"
                      term="Winter 2026"
                    />
                    <MockListingCard 
                      title="Room in Burns Park"
                      price="$650"
                      badge="UM Student"
                      term="Spring 2025"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  )
}

function TrustIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    'shield-check': (
      <svg className="w-5 h-5 text-[#FFCB05]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    'building': (
      <svg className="w-5 h-5 text-[#FFCB05]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    'calendar': (
      <svg className="w-5 h-5 text-[#FFCB05]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    'file-text': (
      <svg className="w-5 h-5 text-[#FFCB05]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  }
  return icons[name] || null
}

function MockListingCard({ title, price, badge, term }: { title: string; price: string; badge: string; term: string }) {
  return (
    <div className="bg-white/90 rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              badge === 'UM Student' ? 'bg-[#FFCB05] text-[#00274C]' : 'bg-emerald-100 text-emerald-700'
            }`}>
              ✓ {badge}
            </span>
            <span className="text-xs text-neutral-500">{term}</span>
          </div>
          <h4 className="font-semibold text-neutral-900 truncate">{title}</h4>
        </div>
        <span className="font-bold text-[#00274C]">{price}<span className="text-xs font-normal text-neutral-500">/mo</span></span>
      </div>
    </div>
  )
}

