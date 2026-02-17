'use client'

import { homeContent } from '@/content/home'

export default function Testimonials() {
  const { testimonials, stats } = homeContent

  // Feature flag check
  if (!testimonials.enabled) {
    return null
  }

  return (
    <section className="py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-[#FFCB05] uppercase tracking-wider mb-3">Testimonials</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight">
            {testimonials.headline}
          </h2>
        </div>

        {/* Testimonial cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.quotes.map((quote, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-100 hover:shadow-lg transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-[#FFCB05]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              
              <p className="text-neutral-700 leading-relaxed mb-6">
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
                  <p className="text-sm text-neutral-500">{quote.role}</p>
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
