'use client'

import { homeContent } from '@/content/home'

export default function FeatureGrid() {
  const { features } = homeContent

  return (
    <section id="features" className="py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
            {features.headline}
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            {features.subheadline}
          </p>
        </div>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.cards.map((card, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 hover:shadow-lg hover:border-[#FFCB05]/50 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00274C] to-[#1E3A5F] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <FeatureIcon name={card.icon} />
              </div>
              
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                {card.title}
              </h3>
              
              <p className="text-neutral-600 leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureIcon({ name }: { name: string }) {
  const icons: Record<string, JSX.Element> = {
    'shield-check': (
      <svg className="w-7 h-7 text-[#FFCB05]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    'calendar-check': (
      <svg className="w-7 h-7 text-[#FFCB05]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l2 2 4-4" />
      </svg>
    ),
    'file-text': (
      <svg className="w-7 h-7 text-[#FFCB05]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    'message-square': (
      <svg className="w-7 h-7 text-[#FFCB05]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  }
  return icons[name] || null
}

