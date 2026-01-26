'use client'

import Link from 'next/link'
import { homeContent } from '@/content/home'

export default function SubleasePacket() {
  const { subleasePacket } = homeContent

  return (
    <section className="py-20 bg-gradient-to-br from-[#00274C] via-[#1E3A5F] to-[#00274C] relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FFCB05' fill-opacity='1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            {subleasePacket.headline}
          </h2>
          <p className="mt-4 text-xl text-[#FFCB05]">
            {subleasePacket.subheadline}
          </p>
          <p className="mt-4 text-neutral-300">
            {subleasePacket.description}
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {subleasePacket.items.map((item, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-[#FFCB05] flex items-center justify-center mb-5">
                <PacketIcon name={item.icon} />
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-3">
                {item.title}
              </h3>
              
              <p className="text-neutral-300 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href={subleasePacket.cta.href}
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl bg-[#FFCB05] text-[#00274C] hover:bg-[#FFD84D] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
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
      <svg className="w-6 h-6 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    'home': (
      <svg className="w-6 h-6 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    'zap': (
      <svg className="w-6 h-6 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  }
  return icons[name] || null
}

