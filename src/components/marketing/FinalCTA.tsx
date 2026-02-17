'use client'

import Link from 'next/link'
import { homeContent } from '@/content/home'

export default function FinalCTA() {
  const { finalCTA } = homeContent

  return (
    <section className="py-24 bg-gradient-to-br from-neutral-50 via-white to-amber-50/30 relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[#FFCB05]/10 via-transparent to-[#00274C]/5 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-[#FFCB05] to-[#F5B800] mb-8 shadow-lg shadow-[#FFCB05]/30">
          <svg className="w-8 h-8 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>

        <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight">
          {finalCTA.headline}
        </h2>
        
        <p className="mt-6 text-xl text-neutral-600 max-w-2xl mx-auto">
          {finalCTA.description}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={finalCTA.primaryCTA.href}
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-full bg-[#00274C] text-white hover:bg-[#1E3A5F] transition-all shadow-lg shadow-[#00274C]/20 hover:shadow-xl hover:-translate-y-0.5"
          >
            {finalCTA.primaryCTA.text}
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href={finalCTA.secondaryCTA.href}
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-full bg-white text-neutral-900 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all"
          >
            {finalCTA.secondaryCTA.text}
          </Link>
        </div>

        {/* Trust note */}
        <p className="mt-12 text-sm text-neutral-400">
          Free to use • No credit card required • Verified community
        </p>
      </div>
    </section>
  )
}
