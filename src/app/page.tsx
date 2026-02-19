import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-[#00274C] py-16 lg:py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <p className="text-[#FFCB05] font-medium mb-4 tracking-wide">
                FOR UMICH STUDENTS
              </p>
              
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-white leading-[1.1] mb-6">
                Find Your Perfect<br />
                <span className="text-[#FFCB05]">Ann Arbor Home</span>
              </h1>
              
              <p className="text-lg text-white/70 mb-8 leading-relaxed max-w-md">
                The trusted housing platform for University of Michigan students. Verified listings, academic-term leases, completely free.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Link 
                  href="/listings" 
                  className="inline-flex items-center gap-2 px-7 py-4 bg-[#FFCB05] text-[#00274C] font-semibold rounded-lg hover:bg-[#e6b800] transition-all hover:scale-[1.02]"
                >
                  Browse Listings
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link 
                  href="/listings/create" 
                  className="inline-flex items-center gap-2 px-7 py-4 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all"
                >
                  Post a Listing
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-10">
                <div>
                  <div className="text-3xl font-bold text-white">60+</div>
                  <div className="text-sm text-white/50">Active Listings</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">100%</div>
                  <div className="text-sm text-white/50">Verified Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">Free</div>
                  <div className="text-sm text-white/50">Always</div>
                </div>
              </div>
            </div>

            {/* Right - Hero Image/Card */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-[#00274C]">Modern 2BR near Campus</h3>
                      <p className="text-sm text-gray-500">Central Campus • Ann Arbor</p>
                    </div>
                    <span className="px-3 py-1 bg-[#FFCB05] text-[#00274C] text-sm font-semibold rounded-full">
                      $1,200/mo
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>2 Beds</span>
                    <span>1 Bath</span>
                    <span>Fall 2026</span>
                  </div>
                </div>
                
                {/* Floating Badge */}
                <div className="absolute -bottom-4 -left-4 bg-[#FFCB05] text-[#00274C] px-4 py-2 rounded-lg font-semibold text-sm shadow-lg">
                  ✓ Verified Student
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#00274C] mb-4">
              Why Students Choose MaizeLease
            </h2>
            <p className="text-gray-600 text-lg">
              Built by Michigan students, for Michigan students. We understand what you need.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'Verified Community',
                description: 'Every student verified with @umich.edu email. Landlords verified with phone and email. No scams, no fakes.',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'Academic Term Filters',
                description: 'Search by Fall, Winter, Spring, or Summer. Find leases that actually match your semester schedule.',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: '100% Free Forever',
                description: 'No fees, no premium tiers, no hidden costs. Free for students and landlords. Always.',
              },
            ].map((feature, index) => (
              <div key={index} className="text-center lg:text-left">
                <div className="w-16 h-16 bg-[#00274C] rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-6 text-[#FFCB05]">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[#00274C] mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-24 bg-gray-50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#00274C] mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 text-lg">
              Get started in minutes. It's that simple.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { num: '01', title: 'Create Account', desc: 'Sign up free with your @umich.edu email' },
              { num: '02', title: 'Get Verified', desc: 'Click the link in your email to verify' },
              { num: '03', title: 'Browse or Post', desc: 'Find listings or create your own' },
              { num: '04', title: 'Connect Directly', desc: 'Message verified users securely' },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-[#FFCB05]/20 mb-2">{step.num}</div>
                <h3 className="text-lg font-bold text-[#00274C] mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/register" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#00274C] text-white font-semibold rounded-lg hover:bg-[#001a33] transition-colors"
            >
              Get Started Free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#00274C] rounded-3xl p-10 lg:p-16 text-center relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFCB05]/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FFCB05]/10 rounded-full blur-3xl" />
              
              <div className="relative">
                <div className="w-16 h-16 bg-[#FFCB05] rounded-full flex items-center justify-center mx-auto mb-8">
                  <svg className="w-8 h-8 text-[#00274C]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                
                <blockquote className="text-2xl lg:text-3xl text-white font-medium mb-8 leading-relaxed">
                  "Finally, a housing platform that actually understands student schedules. Found my Fall sublease in two days."
                </blockquote>
                
                <div>
                  <p className="text-white font-semibold text-lg">Sarah M.</p>
                  <p className="text-white/60">Engineering, Class of '25</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-24 bg-gray-50">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-[#00274C] mb-4">
                Common Questions
              </h2>
            </div>
            
            <div className="space-y-4">
              {[
                { q: 'Is MaizeLease really free?', a: 'Yes, completely free for both students and landlords. No hidden fees, no premium tiers.' },
                { q: 'How do I verify my student status?', a: 'Simply sign up with your @umich.edu email address and click the verification link we send you.' },
                { q: 'Can landlords use MaizeLease?', a: 'Absolutely! Landlords can sign up and verify their accounts with email and phone verification.' },
                { q: 'How do I contact a listing owner?', a: 'Once you\'re signed in, you can view contact information and message listing owners directly.' },
              ].map((faq, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-[#00274C] text-lg mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-24 bg-[#FFCB05]">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#00274C] mb-4">
              Ready to Find Your Home?
            </h2>
            <p className="text-[#00274C]/70 text-lg mb-8">
              Join hundreds of UMich students who've found their perfect place through MaizeLease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register" 
                className="inline-flex items-center justify-center px-8 py-4 bg-[#00274C] text-white font-semibold rounded-lg hover:bg-[#001a33] transition-colors text-lg"
              >
                Create Free Account
              </Link>
              <Link 
                href="/listings" 
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#00274C] font-semibold rounded-lg hover:bg-gray-100 transition-colors text-lg"
              >
                Browse Listings
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
