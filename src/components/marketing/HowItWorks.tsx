'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const steps = [
  {
    number: 1,
    title: 'Verify',
    description: 'Sign up with your @umich.edu email or verify as a landlord. Takes less than a minute.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    number: 2,
    title: 'Browse or Post',
    description: 'Search listings filtered by term and budget, or create your own listing with photos.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    number: 3,
    title: 'Connect',
    description: 'Message verified users directly. Schedule tours, ask questions, negotiate terms.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    number: 4,
    title: 'Agree',
    description: 'Use our sublease packet tools to formalize everything and complete the handoff smoothly.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

export default function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Auto-advance steps for animation
  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % steps.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [isVisible])

  return (
    <section ref={sectionRef} id="how" className="section bg-gradient-to-b from-white to-gray-50">
      <div className="container">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-[#228B22]/10 text-[#228B22] text-sm font-semibold rounded-full mb-4">
            How It Works
          </span>
          <h2 className="mb-4">Four Simple Steps to Your New Place</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Whether you're searching for housing or subleasing your place, we make it easy.
          </p>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block relative">
          {/* Connector Line */}
          <div className="absolute top-16 left-0 right-0 h-1 bg-gray-200">
            <div 
              className="h-full bg-gradient-to-r from-[#FFCB05] to-[#228B22] transition-all duration-500"
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`relative text-center transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Step Circle */}
                <div 
                  className={`relative z-10 w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                    index <= activeStep 
                      ? 'bg-gradient-to-br from-[#FFCB05] to-[#F5B800] shadow-lg scale-110' 
                      : 'bg-white border-2 border-gray-200 hover:border-[#FFCB05]'
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  <div className={`transition-colors duration-300 ${
                    index <= activeStep ? 'text-[#00274C]' : 'text-gray-400'
                  }`}>
                    {step.icon}
                  </div>
                  <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    index <= activeStep 
                      ? 'bg-[#00274C] text-white' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step.number}
                  </div>
                </div>
                
                <h3 className={`text-xl font-bold mt-6 mb-2 transition-colors duration-300 ${
                  index <= activeStep ? 'text-[#00274C]' : 'text-gray-400'
                }`}>
                  {step.title}
                </h3>
                
                <p className={`transition-colors duration-300 ${
                  index <= activeStep ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Steps */}
        <div className="lg:hidden space-y-6">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`flex gap-6 p-6 bg-white rounded-2xl border transition-all duration-500 ${
                index === activeStep 
                  ? 'border-[#FFCB05] shadow-lg' 
                  : 'border-gray-100'
              } ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
              onClick={() => setActiveStep(index)}
            >
              <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                index === activeStep 
                  ? 'bg-gradient-to-br from-[#FFCB05] to-[#F5B800] text-[#00274C]' 
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {step.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded transition-colors ${
                    index === activeStep 
                      ? 'bg-[#00274C] text-white' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    Step {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#00274C] mb-1">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/register" className="btn btn-primary btn-lg">
            Get Started Free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
