'use client'

import Link from 'next/link'
import { homeContent } from '@/content/home'

export default function HowItWorks() {
  const { howItWorks } = homeContent

  return (
    <section id="how" className="py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-[#FFCB05] uppercase tracking-wider mb-3">How It Works</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight">
            {howItWorks.headline}
          </h2>
          <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
            {howItWorks.subheadline}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {howItWorks.steps.map((step, index) => (
            <div key={index} className="relative text-center">
              {/* Connector line */}
              {index < howItWorks.steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-1/2 w-full h-[2px] bg-gradient-to-r from-[#FFCB05] to-[#FFCB05]/20" />
              )}
              
              {/* Step number */}
              <div className="relative z-10 inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-lg shadow-neutral-200/50 border border-neutral-100 mb-6">
                <span className="text-3xl font-bold bg-gradient-to-br from-[#00274C] to-[#1E3A5F] bg-clip-text text-transparent">
                  {step.number}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                {step.title}
              </h3>
              
              <p className="text-neutral-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href={howItWorks.cta.href}
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-full bg-[#00274C] text-white hover:bg-[#1E3A5F] transition-all shadow-lg shadow-[#00274C]/20 hover:shadow-xl hover:-translate-y-0.5"
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
