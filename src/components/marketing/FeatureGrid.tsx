'use client'

import { homeContent } from '@/content/home'

export default function FeatureGrid() {
  const { features } = homeContent

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-[#FFCB05] uppercase tracking-wider mb-3">Features</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight">
            {features.headline}
          </h2>
          <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
            {features.subheadline}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.cards.map((card, index) => (
            <div
              key={index}
              className="group relative bg-neutral-50 rounded-3xl p-8 hover:bg-white hover:shadow-xl hover:shadow-neutral-200/50 transition-all duration-300 border border-transparent hover:border-neutral-100"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFCB05] to-[#F5B800] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FeatureIcon name={card.icon} />
              </div>
              
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                {card.title}
              </h3>
              
              <p className="text-neutral-600 leading-relaxed">
                {card.description}
              </p>

              {/* Hover Arrow */}
              <div className="mt-6 flex items-center text-[#00274C] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm">Learn more</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-neutral-50 rounded-2xl p-6 text-center">
            <p className="text-2xl font-bold text-[#00274C]">60+</p>
            <p className="text-sm text-neutral-500 mt-1">Active Listings</p>
          </div>
          <div className="bg-neutral-50 rounded-2xl p-6 text-center">
            <p className="text-2xl font-bold text-[#00274C]">4</p>
            <p className="text-sm text-neutral-500 mt-1">Term Filters</p>
          </div>
          <div className="bg-neutral-50 rounded-2xl p-6 text-center">
            <p className="text-2xl font-bold text-[#00274C]">100%</p>
            <p className="text-sm text-neutral-500 mt-1">Free to Use</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    'shield-check': (
      <svg className="w-7 h-7 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    'calendar-check': (
      <svg className="w-7 h-7 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l2 2 4-4" />
      </svg>
    ),
    'file-text': (
      <svg className="w-7 h-7 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    'message-square': (
      <svg className="w-7 h-7 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  }
  return icons[name] || null
}
