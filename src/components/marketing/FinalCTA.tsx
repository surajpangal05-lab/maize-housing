'use client'

import Link from 'next/link'
import { homeContent } from '@/content/home'

export default function FinalCTA() {
  const { finalCTA } = homeContent

  return (
    <section className="py-20 bg-gradient-to-br from-[#FFCB05] to-[#F5B800] relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300274C' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#00274C]">
          {finalCTA.headline}
        </h2>
        
        <p className="mt-6 text-xl text-[#00274C]/80 max-w-2xl mx-auto">
          {finalCTA.description}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={finalCTA.primaryCTA.href}
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl bg-[#00274C] text-white hover:bg-[#1E3A5F] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            {finalCTA.primaryCTA.text}
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href={finalCTA.secondaryCTA.href}
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl border-2 border-[#00274C]/30 text-[#00274C] hover:bg-[#00274C]/10 transition-all"
          >
            {finalCTA.secondaryCTA.text}
          </Link>
        </div>
      </div>
    </section>
  )
}

