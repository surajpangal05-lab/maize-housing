'use client'

import Link from 'next/link'
import { homeContent } from '@/content/home'

export default function HowItWorks() {
  const { howItWorks } = homeContent

  return (
    <section id="how" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
            {howItWorks.headline}
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            {howItWorks.subheadline}
          </p>
        </div>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {howItWorks.steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line (hidden on mobile, visible on lg) */}
              {index < howItWorks.steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-[#FFCB05] to-[#FFCB05]/30" />
              )}
              
              <div className="relative flex flex-col items-center text-center">
                {/* Step number */}
                <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-[#00274C] to-[#1E3A5F] flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-[#FFCB05]">{step.number}</span>
                </div>
                
                <h3 className="mt-6 text-xl font-semibold text-neutral-900">
                  {step.title}
                </h3>
                
                <p className="mt-3 text-neutral-600 leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href={howItWorks.cta.href}
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl bg-[#00274C] text-white hover:bg-[#1E3A5F] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            {howItWorks.cta.text}
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

