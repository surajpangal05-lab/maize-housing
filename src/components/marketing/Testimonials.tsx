'use client'

import { useState, useEffect, useRef } from 'react'

const testimonials = [
  {
    text: "Finally, a housing platform that actually understands student schedules! Found my Fall sublease in two days. The verification badges gave me so much confidence.",
    name: "Sarah M.",
    role: "Engineering Student",
    year: "Class of 2025",
    rating: 5,
    avatar: "SM",
    color: "bg-[#FFCB05]",
  },
  {
    text: "As a landlord, I love that I only get inquiries from verified UMich students. Saves so much time filtering out spam. The quality of renters is excellent.",
    name: "Patricia L.",
    role: "Property Owner",
    year: "Ann Arbor",
    rating: 5,
    avatar: "PL",
    color: "bg-[#228B22]",
  },
  {
    text: "The sublease packet tools were a lifesaver when I went abroad. Everything was documented, and the handoff was smooth. Highly recommend!",
    name: "James K.",
    role: "Graduate Student",
    year: "Class of 2026",
    rating: 5,
    avatar: "JK",
    color: "bg-[#00274C]",
  },
  {
    text: "Way better than Facebook groups. No random messages, no scams, just verified students and landlords. Found a great 2BR near Central Campus!",
    name: "Emily R.",
    role: "LSA Student",
    year: "Class of 2025",
    rating: 5,
    avatar: "ER",
    color: "bg-[#FFCB05]",
  },
  {
    text: "Posted my listing and had 10 verified inquiries within a week. The term filter system is genius - only got messages from students who actually needed Winter housing.",
    name: "Michael T.",
    role: "Ross MBA",
    year: "Class of 2024",
    rating: 5,
    avatar: "MT",
    color: "bg-[#228B22]",
  },
]

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isAutoPlaying) return
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const handlePrev = () => {
    setIsAutoPlaying(false)
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const handleNext = () => {
    setIsAutoPlaying(false)
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }

  return (
    <section className="section bg-[#00274C] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="testimonial-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="2" fill="#FFCB05" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#testimonial-pattern)" />
        </svg>
      </div>

      <div className="container relative">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-[#FFCB05]/20 text-[#FFCB05] text-sm font-semibold rounded-full mb-4">
            Testimonials
          </span>
          <h2 className="text-white mb-4">What Students Are Saying</h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Join hundreds of UMich students and landlords who've found their perfect match.
          </p>
        </div>

        {/* Carousel */}
        <div ref={containerRef} className="relative max-w-4xl mx-auto">
          {/* Main Card */}
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl">
            {/* Quote Icon */}
            <div className="mb-6">
              <svg className="w-12 h-12 text-[#FFCB05]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>

            {/* Testimonial Text */}
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8">
              "{testimonials[activeIndex].text}"
            </p>

            {/* Stars */}
            <div className="flex gap-1 mb-6">
              {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                <svg key={i} className="w-6 h-6 text-[#FFCB05]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            {/* Author */}
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full ${testimonials[activeIndex].color} flex items-center justify-center`}>
                <span className="text-lg font-bold text-white">
                  {testimonials[activeIndex].avatar}
                </span>
              </div>
              <div>
                <p className="font-semibold text-[#00274C]">{testimonials[activeIndex].name}</p>
                <p className="text-gray-500 text-sm">{testimonials[activeIndex].role} • {testimonials[activeIndex].year}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button 
              onClick={handlePrev}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Previous testimonial"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => { setIsAutoPlaying(false); setActiveIndex(index); }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === activeIndex 
                      ? 'bg-[#FFCB05] w-8' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            
            <button 
              onClick={handleNext}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Next testimonial"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
