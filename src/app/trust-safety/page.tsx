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
      description: 'For first meetings, choose a public space like a coffee shop or the Diag.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Verify Identity',
      description: 'Only communicate with verified users. Ask for student ID if needed.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'Document Everything',
      description: 'Get agreements in writing before exchanging money.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Secure Payments',
      description: 'Never wire money upfront. Use traceable methods.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      title: 'Trust Your Instincts',
      description: 'If something feels off, walk away from the deal.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      title: 'Visit in Person',
      description: 'Always see the property before signing anything.',
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-[#00274C] py-16">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-white mb-4">Trust & Safety</h1>
            <p className="text-xl text-white/70">
              Learn how our verification system works and how to stay safe when finding housing.
            </p>
          </div>
        </div>
      </section>

      {/* Verification Process */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="mb-4">How Verification Works</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Every user on MaizeLease goes through our verification process.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Students */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-[#FFCB05] flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#00274C]">For Students</h3>
                  <p className="text-sm text-gray-500">@umich.edu email required</p>
                </div>
              </div>

              <div className="space-y-4">
                {verificationSteps.students.map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FFCB05] text-[#00274C] flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                    <div>
                      <p className="font-medium text-[#00274C]">{step.title}</p>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Landlords */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-[#00274C] flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#00274C]">For Landlords</h3>
                  <p className="text-sm text-gray-500">Email + phone verification</p>
                </div>
              </div>

              <div className="space-y-4">
                {verificationSteps.landlords.map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#00274C] text-white flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                    <div>
                      <p className="font-medium text-[#00274C]">{step.title}</p>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="mb-4">Safety Tips</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              While we verify all users, always practice caution.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {safetyTips.map((tip, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="w-10 h-10 rounded-lg bg-[#00274C]/10 flex items-center justify-center text-[#00274C] mb-4">
                  {tip.icon}
                </div>
                <h3 className="font-semibold text-[#00274C] mb-2">{tip.title}</h3>
                <p className="text-sm text-gray-600">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="section-sm bg-[#00274C]">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-white/80 mb-4">
              <strong className="text-white">Important:</strong> Verification improves trust but does not replace independent due diligence. 
              Always verify lease terms independently.
            </p>
            <Link href="/contact" className="text-[#FFCB05] font-medium hover:underline">
              Report suspicious activity →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="mb-4">Ready to Get Started?</h2>
            <p className="text-gray-600 mb-8">
              Join the trusted community of UMich students and landlords.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/register" className="btn btn-primary">
                Create Free Account
              </Link>
              <Link href="/listings" className="btn btn-outline">
                Browse Listings
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
