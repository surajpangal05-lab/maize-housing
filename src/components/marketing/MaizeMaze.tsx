'use client'

import { useState } from 'react'
import Link from 'next/link'

interface MazeStep {
  id: string
  question: string
  options: {
    text: string
    nextId: string | null
    result?: {
      title: string
      tip: string
      cta: string
      href: string
      filter?: string
    }
  }[]
}

const mazeSteps: MazeStep[] = [
  {
    id: 'start',
    question: "Let's find your perfect place! What's your situation?",
    options: [
      { text: "I'm looking for housing", nextId: 'looking' },
      { text: "I want to sublease my place", nextId: 'sublease' },
    ]
  },
  {
    id: 'looking',
    question: 'When do you need to move in?',
    options: [
      { text: 'Fall Semester', nextId: 'budget', result: undefined },
      { text: 'Winter Semester', nextId: 'budget', result: undefined },
      { text: 'Spring/Summer', nextId: 'budget', result: undefined },
      { text: "I'm flexible", nextId: 'budget', result: undefined },
    ]
  },
  {
    id: 'budget',
    question: "What's your budget range?",
    options: [
      { 
        text: 'Under $800/month', 
        nextId: null, 
        result: {
          title: '💰 Budget-Friendly Finds',
          tip: 'Look for rooms in shared houses or studios near North Campus. Many landlords offer utilities included!',
          cta: 'Browse Affordable Listings',
          href: '/listings?maxRent=800',
          filter: 'maxRent=800'
        }
      },
      { 
        text: '$800 - $1,200/month', 
        nextId: null, 
        result: {
          title: '🏠 Sweet Spot Rentals',
          tip: 'You have great options! Check out 1-bedroom apartments or shared 2BRs near Central Campus.',
          cta: 'Browse Mid-Range Listings',
          href: '/listings?minRent=800&maxRent=1200',
          filter: 'minRent=800&maxRent=1200'
        }
      },
      { 
        text: '$1,200+ /month', 
        nextId: null, 
        result: {
          title: '✨ Premium Living',
          tip: 'Explore modern apartments with amenities, full houses, or prime downtown locations!',
          cta: 'Browse Premium Listings',
          href: '/listings?minRent=1200',
          filter: 'minRent=1200'
        }
      },
    ]
  },
  {
    id: 'sublease',
    question: 'Why are you subleasing?',
    options: [
      { 
        text: 'Study abroad / Co-op', 
        nextId: null, 
        result: {
          title: '✈️ Study Abroad Sublease',
          tip: 'Post early! Students start looking 2-3 months ahead. Include photos and be clear about your dates.',
          cta: 'Post Your Sublease',
          href: '/listings/create',
        }
      },
      { 
        text: 'Graduating early', 
        nextId: null, 
        result: {
          title: '🎓 Graduation Sublease',
          tip: 'Winter/Spring terms are high demand! Highlight proximity to campus and any included furniture.',
          cta: 'Post Your Sublease',
          href: '/listings/create',
        }
      },
      { 
        text: 'Moving elsewhere', 
        nextId: null, 
        result: {
          title: '📦 General Sublease',
          tip: 'Be flexible with dates to attract more renters. Verified listings get 3x more responses!',
          cta: 'Post Your Sublease',
          href: '/listings/create',
        }
      },
    ]
  },
]

export default function MaizeMaze() {
  const [currentStep, setCurrentStep] = useState<string>('start')
  const [result, setResult] = useState<MazeStep['options'][0]['result'] | null>(null)
  const [history, setHistory] = useState<string[]>([])
  
  const currentMazeStep = mazeSteps.find(s => s.id === currentStep)
  
  const handleOption = (option: MazeStep['options'][0]) => {
    if (option.result) {
      setResult(option.result)
    } else if (option.nextId) {
      setHistory([...history, currentStep])
      setCurrentStep(option.nextId)
    }
  }
  
  const handleBack = () => {
    if (history.length > 0) {
      const newHistory = [...history]
      const prevStep = newHistory.pop()!
      setHistory(newHistory)
      setCurrentStep(prevStep)
    }
  }
  
  const handleReset = () => {
    setCurrentStep('start')
    setHistory([])
    setResult(null)
  }

  return (
    <section className="section bg-gradient-to-b from-gray-50 to-white">
      <div className="container">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-[#FFCB05]/20 text-[#00274C] text-sm font-semibold rounded-full mb-4">
            Interactive Guide
          </span>
          <h2 className="mb-4">Navigate the Maize Maze</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Answer a few quick questions to discover personalized housing recommendations and tips tailored just for you.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Maze Header */}
            <div className="bg-gradient-to-r from-[#00274C] to-[#1E3A5F] px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FFCB05] rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <span className="text-white font-semibold">Maize Maze</span>
                </div>
                {history.length > 0 && !result && (
                  <button 
                    onClick={handleBack}
                    className="text-white/70 hover:text-white text-sm font-medium flex items-center gap-1 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                )}
              </div>
              
              {/* Progress indicator */}
              <div className="mt-4 flex gap-2">
                {[0, 1, 2].map((i) => (
                  <div 
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i <= history.length ? 'bg-[#FFCB05]' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Maze Content */}
            <div className="p-8">
              {result ? (
                <div className="text-center animate-scale-in">
                  <div className="text-5xl mb-4">{result.title.split(' ')[0]}</div>
                  <h3 className="text-xl font-semibold text-[#00274C] mb-4">
                    {result.title.split(' ').slice(1).join(' ')}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {result.tip}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href={result.href} className="btn btn-primary">
                      {result.cta}
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                    <button onClick={handleReset} className="btn btn-ghost">
                      Start Over
                    </button>
                  </div>
                </div>
              ) : currentMazeStep ? (
                <div className="animate-fade-in">
                  <h3 className="text-xl font-semibold text-[#00274C] mb-6 text-center">
                    {currentMazeStep.question}
                  </h3>
                  <div className="space-y-3">
                    {currentMazeStep.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleOption(option)}
                        className="w-full p-4 text-left bg-gray-50 hover:bg-[#FFCB05]/10 border-2 border-transparent hover:border-[#FFCB05] rounded-xl transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800 group-hover:text-[#00274C]">
                            {option.text}
                          </span>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-[#FFCB05] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
