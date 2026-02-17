'use client'

import Link from 'next/link'
import { homeContent } from '@/content/home'

export default function SubleasePacket() {
  const { subleasePacket } = homeContent

  return (
    <section className="py-24 bg-gradient-to-br from-neutral-50 via-white to-amber-50/30 relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-[#FFCB05]/10 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-[#00274C]/5 to-transparent rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-[#FFCB05] uppercase tracking-wider mb-3">Resources</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight">
            {subleasePacket.headline}
          </h2>
          <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
            {subleasePacket.description}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {subleasePacket.items.map((item, index) => (
            <div
              key={index}
              className="group bg-white rounded-3xl p-8 shadow-sm border border-neutral-100 hover:shadow-xl hover:shadow-neutral-200/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFCB05] to-[#F5B800] flex items-center justify-center mb-6">
                <PacketIcon name={item.icon} />
              </div>
              
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                {item.title}
              </h3>
              
              <p className="text-neutral-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href={subleasePacket.cta.href}
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-full bg-[#00274C] text-white hover:bg-[#1E3A5F] transition-all shadow-lg shadow-[#00274C]/20 hover:shadow-xl hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {subleasePacket.cta.text}
          </Link>
        </div>
      </div>
    </section>
  )
}

function PacketIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    'clipboard-check': (
      <svg className="w-7 h-7 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    'home': (
      <svg className="w-7 h-7 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    'zap': (
      <svg className="w-7 h-7 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  }
  return icons[name] || null
}
