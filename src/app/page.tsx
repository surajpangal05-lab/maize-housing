import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#00274C] via-[#001a33] to-[#00274C]">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FFCB05]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FFCB05]/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FFCB05]/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FFCB05]/20 rounded-full mb-6">
              <span className="w-2 h-2 bg-[#FFCB05] rounded-full animate-pulse" />
              <span className="text-sm text-[#FFCB05] font-medium">Built for the UMich Community</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Find trusted housing.
              <br />
              <span className="text-[#FFCB05]">Skip the chaos.</span>
            </h1>
            
            <p className="mt-6 text-lg text-neutral-300 max-w-xl">
              The only housing platform built specifically for University of Michigan students and verified Ann Arbor landlords. Structured subleasing, verified identities, and tools that actually help.
            </p>
            
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/listings" className="btn btn-primary text-base px-6 py-3">
                Browse Listings
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/register" className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold rounded-lg border-2 border-white text-white hover:bg-white hover:text-[#00274C] transition-all">
                Post a Listing
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap gap-8">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#FFCB05]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-neutral-300">.edu Email Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#FFCB05]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-neutral-300">Sublease Packet Generator</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#FFCB05]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-neutral-300">Academic Term Filters</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900">Why MaizeLease?</h2>
            <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
              Built by UMich students who experienced the chaos of finding housing firsthand.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-100">
              <div className="w-12 h-12 rounded-xl bg-[#FFCB05] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Verified Identity</h3>
              <p className="text-neutral-600">
                Students verify with @umich.edu email. Landlords verify email + phone. See who you&apos;re dealing with.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="badge badge-maize">Verified UM Student</span>
                <span className="badge badge-green">Verified Landlord</span>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-100">
              <div className="w-12 h-12 rounded-xl bg-[#FFCB05] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Academic Calendar Aware</h3>
              <p className="text-neutral-600">
                Filter by Fall, Winter, Spring, Summer terms. Find housing that fits your academic schedule, not arbitrary dates.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-2 py-0.5 text-xs font-medium bg-[#00274C]/10 text-[#00274C] rounded">Fall</span>
                <span className="px-2 py-0.5 text-xs font-medium bg-[#00274C]/10 text-[#00274C] rounded">Winter</span>
                <span className="px-2 py-0.5 text-xs font-medium bg-[#00274C]/10 text-[#00274C] rounded">Spring</span>
                <span className="px-2 py-0.5 text-xs font-medium bg-[#00274C]/10 text-[#00274C] rounded">Summer</span>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-100">
              <div className="w-12 h-12 rounded-xl bg-[#FFCB05] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Sublease Packet Generator</h3>
              <p className="text-neutral-600">
                Download ready-to-use checklists for sublease agreements, move-in conditions, and utilities handoff.
              </p>
              <ul className="mt-4 space-y-1 text-sm text-neutral-500">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Agreement checklist
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Move-in condition log
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Utilities handoff guide
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* How it Works */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900">How it Works</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Verify Your Identity', desc: 'Sign up with your @umich.edu email or verify as a landlord.' },
              { step: '02', title: 'Post or Browse', desc: 'Create a listing with academic terms, or search with smart filters.' },
              { step: '03', title: 'Connect Safely', desc: 'Message verified users directly through our platform.' },
              { step: '04', title: 'Close the Deal', desc: 'Use our sublease packet and mark complete when done.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#00274C] text-[#FFCB05] font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">{item.title}</h3>
                <p className="text-sm text-neutral-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-[#00274C]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to find your next place?
          </h2>
          <p className="text-lg text-neutral-300 mb-8">
            Join thousands of UMich students who found housing the smart way.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="btn btn-primary text-base px-8 py-3">
              Create Free Account
            </Link>
            <Link href="/listings" className="inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-semibold rounded-lg border-2 border-white text-white hover:bg-white hover:text-[#00274C] transition-all">
              View Listings
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
