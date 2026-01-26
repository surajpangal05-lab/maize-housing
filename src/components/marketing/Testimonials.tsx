'use client'

import { homeContent } from '@/content/home'

export default function Testimonials() {
  const { testimonials, stats } = homeContent

  // Feature flag check
  if (!testimonials.enabled) {
    return null
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
            {testimonials.headline}
          </h2>
        </div>

        {/* Testimonial cards */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {testimonials.quotes.map((quote, index) => (
            <div
              key={index}
              className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100 relative"
            >
              {/* Quote mark */}
              <svg className="absolute top-4 right-4 w-8 h-8 text-[#FFCB05]/30" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              
              <p className="text-neutral-700 leading-relaxed mb-6 pr-8">
                "{quote.text}"
              </p>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00274C] to-[#1E3A5F] flex items-center justify-center">
                  <span className="text-sm font-semibold text-[#FFCB05]">
                    {quote.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">{quote.name}</p>
                  <p className="text-sm text-neutral-500">{quote.role} • {quote.year}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats row (feature flagged) */}
        {stats.enabled && (
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            {stats.items.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-bold text-[#00274C]">{stat.value}</p>
                <p className="mt-2 text-neutral-600">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

