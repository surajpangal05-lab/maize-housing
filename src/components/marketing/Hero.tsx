'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    setIsVisible(true)
  }, [])

  const stats = [
    { value: '60+', label: 'Verified Listings' },
    { value: '4', label: 'Academic Terms' },
    { value: '100%', label: 'Free to Use' },
  ]

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920&q=80')`,
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00274C]/95 via-[#00274C]/85 to-[#1E3A5F]/80" />
        
        {/* Decorative Maize Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="maize-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="#FFCB05" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#maize-pattern)" />
          </svg>
        </div>
        
        {/* Animated Wave */}
        <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
          <svg viewBox="0 0 1440 120" fill="none" className="absolute bottom-0 w-full">
            <path 
              d="M0 120L48 108C96 96 192 72 288 66C384 60 480 72 576 78C672 84 768 84 864 78C960 72 1056 60 1152 60C1248 60 1344 72 1392 78L1440 84V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z" 
              fill="white"
            />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative container pt-32 pb-48">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <span className="w-2 h-2 bg-[#FFCB05] rounded-full animate-pulse" />
            <span className="text-white/90 text-sm font-medium">Trusted by UMich Students</span>
          </div>
          
          {/* Headline */}
          <h1 className={`text-white mb-6 transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            Find Your Perfect{' '}
            <span className="text-[#FFCB05]">UMich Home</span>
          </h1>
          
          {/* Subheadline */}
          <p className={`text-xl md:text-2xl text-white/80 mb-8 max-w-2xl leading-relaxed transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            Verified Subleases & Leases Tailored to Your Semester. 
            The only housing platform built specifically for Michigan students.
          </p>

          {/* CTAs */}
          <div className={`flex flex-wrap gap-4 mb-16 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <Link
              href="/listings"
              className="btn btn-primary btn-lg group"
            >
              Browse Listings
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/listings/create"
              className="btn btn-secondary btn-lg"
            >
              Post Your Listing Free
            </Link>
          </div>

          {/* Stats Bar */}
          <div className={`flex flex-wrap gap-8 md:gap-16 transition-all duration-700 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#FFCB05]/20 flex items-center justify-center">
                  <span className="text-[#FFCB05] font-bold text-lg">{stat.value}</span>
                </div>
                <span className="text-white/70 text-sm font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Card Preview */}
        <div className={`hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-80 transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'
        }`}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 animate-float">
            <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-maize">Verified</span>
              <span className="badge badge-gray">Fall 2025</span>
            </div>
            <h4 className="font-semibold text-[#00274C] mb-1">Cozy 2BR near Campus</h4>
            <p className="text-gray-500 text-sm mb-3">Ann Arbor, Central Campus</p>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-[#00274C]">$1,200/mo</span>
              <span className="text-sm text-[#228B22] font-medium">Available Now</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-700 delay-700 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <span className="text-white/50 text-xs font-medium tracking-wider">SCROLL</span>
          <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  )
}
