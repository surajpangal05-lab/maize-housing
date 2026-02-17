'use client'

import { useState } from 'react'
import Link from 'next/link'
import { homeContent } from '@/content/home'

export default function FAQAccordion() {
  const { faq } = homeContent
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-[#FFCB05] uppercase tracking-wider mb-3">FAQ</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight">
            {faq.headline}
          </h2>
          <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
            {faq.subheadline}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faq.questions.map((item, index) => (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-200 ${
                  openIndex === index 
                    ? 'bg-neutral-50 border-neutral-200' 
                    : 'bg-white border-neutral-100 hover:border-neutral-200'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-semibold text-neutral-900 pr-4">
                    {item.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    openIndex === index ? 'bg-[#00274C]' : 'bg-neutral-100'
                  }`}>
                    <svg
                      className={`w-4 h-4 transition-all duration-200 ${
                        openIndex === index ? 'rotate-180 text-white' : 'text-neutral-500'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-6 text-neutral-600 leading-relaxed">
                    {item.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-neutral-500 mb-4">Still have questions?</p>
            <Link
              href={faq.cta.href}
              className="inline-flex items-center gap-2 px-6 py-3 text-[#00274C] font-semibold bg-[#FFCB05]/10 hover:bg-[#FFCB05]/20 rounded-full transition-colors"
            >
              Contact Us
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
