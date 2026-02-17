import Link from 'next/link'

export default function TrustSafetyPage() {
  const verificationSteps = {
    students: [
      { step: 1, title: 'Sign Up', description: 'Create an account with your @umich.edu email address' },
      { step: 2, title: 'Check Email', description: 'Receive a verification link in your Michigan inbox' },
      { step: 3, title: 'Click to Verify', description: 'One click and you\'re verified as a UMich student' },
      { step: 4, title: 'Get Badge', description: 'Your profile displays the "Verified Student" badge' },
    ],
    landlords: [
      { step: 1, title: 'Sign Up', description: 'Create an account with your email address' },
      { step: 2, title: 'Verify Email', description: 'Confirm your email via the link we send' },
      { step: 3, title: 'Add Phone', description: 'Enter your phone number for SMS verification' },
      { step: 4, title: 'Get Badge', description: 'Your profile displays the "Verified Landlord" badge' },
    ]
  }

  const safetyTips = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Meet in Public',
      description: 'For first meetings, choose a public space like a coffee shop or the Diag. Never meet alone at night.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Verify Identity',
      description: 'Only communicate with verified users. Ask for student ID or landlord credentials if needed.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'Document Everything',
      description: 'Use our messaging system to keep records. Get agreements in writing before exchanging money.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Secure Payments',
      description: 'Never wire money or pay in cash upfront. Use traceable methods and get receipts.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      title: 'Trust Your Instincts',
      description: 'If something feels off, it probably is. Walk away from deals that seem too good to be true.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      title: 'Visit in Person',
      description: 'Always see the property before signing anything. Take photos and note any issues.',
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#00274C] to-[#1E3A5F] py-20">
        <div className="container">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-2 bg-[#FFCB05]/20 text-[#FFCB05] text-sm font-semibold rounded-full mb-6">
              Trust & Safety
            </span>
            <h1 className="text-white mb-6">Your Safety is Our Priority</h1>
            <p className="text-xl text-white/70 leading-relaxed">
              MaizeLease is built on trust. Learn how our verification system works and how to stay safe when finding housing.
            </p>
          </div>
        </div>
      </section>

      {/* Verification Process */}
      <section className="section bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="mb-4">How Verification Works</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Every user on MaizeLease goes through our verification process. Here's what it looks like.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Students */}
            <div className="bg-gradient-to-br from-[#FFCB05]/10 to-white rounded-3xl p-8 border border-[#FFCB05]/20">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#FFCB05] flex items-center justify-center">
                  <svg className="w-7 h-7 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#00274C]">For Students</h3>
                  <p className="text-gray-500">@umich.edu email required</p>
                </div>
              </div>

              <div className="space-y-6">
                {verificationSteps.students.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FFCB05] text-[#00274C] flex items-center justify-center font-bold">
                      {step.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#00274C]">{step.title}</h4>
                      <p className="text-gray-600 text-sm">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-white rounded-xl border border-[#FFCB05]/30">
                <div className="flex items-center gap-2 text-[#00274C] font-semibold">
                  <svg className="w-5 h-5 text-[#FFCB05]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified Student Badge
                </div>
              </div>
            </div>

            {/* Landlords */}
            <div className="bg-gradient-to-br from-[#228B22]/10 to-white rounded-3xl p-8 border border-[#228B22]/20">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#228B22] flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#00274C]">For Landlords</h3>
                  <p className="text-gray-500">Email + phone verification</p>
                </div>
              </div>

              <div className="space-y-6">
                {verificationSteps.landlords.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#228B22] text-white flex items-center justify-center font-bold">
                      {step.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#00274C]">{step.title}</h4>
                      <p className="text-gray-600 text-sm">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-white rounded-xl border border-[#228B22]/30">
                <div className="flex items-center gap-2 text-[#00274C] font-semibold">
                  <svg className="w-5 h-5 text-[#228B22]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified Landlord Badge
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-[#00274C]/10 text-[#00274C] text-sm font-semibold rounded-full mb-4">
              Safety Tips
            </span>
            <h2 className="mb-4">Stay Safe When Searching</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              While we verify all users, always practice caution. Follow these guidelines for a safe housing search.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safetyTips.map((tip, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-[#FFCB05]/20 flex items-center justify-center text-[#00274C] mb-4">
                  {tip.icon}
                </div>
                <h3 className="text-lg font-semibold text-[#00274C] mb-2">{tip.title}</h3>
                <p className="text-gray-600">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="section-sm bg-[#00274C]">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-12 h-12 rounded-full bg-[#FFCB05]/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-6 h-6 text-[#FFCB05]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-white/80 leading-relaxed mb-6">
              <strong className="text-white">Important:</strong> Verification improves trust but does not replace independent due diligence. 
              MaizeLease is a platform to connect students and landlords. We are not a party to any agreements between users. 
              Always verify lease terms independently and consult with housing authorities if needed.
            </p>
            <Link href="/contact" className="text-[#FFCB05] font-semibold hover:underline">
              Report suspicious activity →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-white">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="mb-4">Ready to Get Started?</h2>
            <p className="text-gray-600 text-lg mb-8">
              Join the trusted community of UMich students and landlords today.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/register" className="btn btn-primary btn-lg">
                Create Free Account
              </Link>
              <Link href="/listings" className="btn btn-outline btn-lg">
                Browse Listings
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
