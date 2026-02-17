'use client'

import { homeContent } from '@/content/home'

export default function VerificationTrust() {
  const { trust } = homeContent

  return (
    <section id="trust" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-[#FFCB05] uppercase tracking-wider mb-3">Trust & Safety</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight">
            {trust.headline}
          </h2>
          <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
            {trust.subheadline}
          </p>
        </div>

        {/* Two columns */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Students */}
          <div className="bg-gradient-to-br from-amber-50 to-white rounded-3xl p-8 border border-amber-100/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#FFCB05] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900">{trust.students.title}</h3>
            </div>
            
            <ul className="space-y-3 mb-6">
              {trust.students.requirements.map((req, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-neutral-700">{req}</span>
                </li>
              ))}
            </ul>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFCB05] text-[#00274C] font-semibold text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {trust.students.badge}
            </div>
          </div>

          {/* Landlords */}
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-3xl p-8 border border-emerald-100/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900">{trust.landlords.title}</h3>
            </div>
            
            <ul className="space-y-3 mb-6">
              {trust.landlords.requirements.map((req, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-neutral-700">{req}</span>
                </li>
              ))}
            </ul>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white font-semibold text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {trust.landlords.badge}
            </div>
          </div>
        </div>

        {/* What this prevents */}
        <div className="mt-16 text-center">
          <p className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-6">What verification prevents</p>
          <div className="flex flex-wrap justify-center gap-3">
            {trust.prevents.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 text-neutral-600 text-sm font-medium"
              >
                <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
            <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-amber-800">{trust.disclaimer}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
