import Link from 'next/link'

const STUDENT_STEPS = [
  { title: 'Sign up', desc: 'Create an account with your @umich.edu email address' },
  { title: 'Check email', desc: 'Receive a verification link in your Michigan inbox' },
  { title: 'Click to verify', desc: "One click and you're verified as a UMich student" },
  { title: 'Get badge', desc: 'Your profile displays the "Verified Student" badge' },
]

const LANDLORD_STEPS = [
  { title: 'Sign up', desc: 'Create an account with your email address' },
  { title: 'Verify email', desc: 'Confirm your email via the link we send' },
  { title: 'Add phone', desc: 'Enter your phone number for SMS verification' },
  { title: 'Get badge', desc: 'Your profile displays the "Verified Landlord" badge' },
]

const TIPS = [
  { title: 'Meet in public', desc: 'For first meetings, choose a public space like a coffee shop or the Diag.', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
  { title: 'Verify identity', desc: 'Only communicate with verified users. Ask for student ID if needed.', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { title: 'Document everything', desc: 'Get agreements in writing before exchanging money.', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { title: 'Secure payments', desc: 'Never wire money upfront. Use traceable methods.', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { title: 'Trust your instincts', desc: 'If something feels off, walk away from the deal.', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  { title: 'Visit in person', desc: 'Always see the property before signing anything.', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
]

function StepCard({ title, subtitle, steps, accent }: { title: string; subtitle: string; steps: typeof STUDENT_STEPS; accent: 'maize' | 'blue' }) {
  return (
    <div className="p-6 rounded-xl bg-white border-2 border-gray-200 hover:border-[#FFCB05] hover:shadow-lg transition-all">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-16 h-16 bg-[#00274C] rounded-2xl flex items-center justify-center">
          <svg className="w-8 h-8 text-[#FFCB05]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {accent === 'maize'
              ? <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></>
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />}
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-[#00274C]">{title}</h3>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-4">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex-shrink-0 w-20 h-20 bg-[#FFCB05] rounded-full flex items-center justify-center text-[#00274C] text-lg font-bold">{i + 1}</div>
            <div>
              <p className="text-sm font-medium text-[#00274C]">{step.title}</p>
              <p className="text-xs text-slate-400">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TrustSafetyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#00274C] to-[#003D6E] pt-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-white text-3xl lg:text-4xl font-bold mb-3">Trust & Safety</h1>
            <p className="text-white/70 text-base">Learn how our verification system works and how to stay safe when finding housing.</p>
          </div>
        </div>
      </div>

      {/* Verification */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold mb-4">Verification</div>
            <h2 className="text-3xl font-bold mb-3 text-[#00274C]">How verification works</h2>
            <p className="text-slate-400 max-w-md mx-auto text-sm">Every user on MaizeLease goes through our verification process.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            <StepCard title="For Students" subtitle="@umich.edu email required" steps={STUDENT_STEPS} accent="maize" />
            <StepCard title="For Landlords" subtitle="Email + phone verification" steps={LANDLORD_STEPS} accent="blue" />
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold mb-4">Safety</div>
            <h2 className="text-3xl font-bold mb-3 text-[#00274C]">Safety tips</h2>
            <p className="text-slate-400 max-w-md mx-auto text-sm">While we verify all users, always practice caution.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {TIPS.map(tip => (
              <div key={tip.title} className="p-5 rounded-xl bg-white border-2 border-gray-200 hover:border-[#FFCB05] hover:shadow-lg transition-all">
                <div className="w-16 h-16 bg-[#00274C] rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-[#FFCB05]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tip.icon} />
                  </svg>
                </div>
                <h3 className="font-semibold text-sm mb-1 text-[#00274C]">{tip.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-10 bg-gradient-to-r from-[#00274C] to-[#003D6E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-white/70 text-sm">
              <strong className="text-white">Important:</strong> Verification improves trust but does not replace independent due diligence. Always verify lease terms independently.
            </p>
            <Link href="/contact" className="text-[#FFCB05] text-sm font-medium hover:underline mt-3 inline-block">
              Report suspicious activity →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold mb-3 text-[#00274C]">Ready to get started?</h2>
            <p className="text-slate-400 text-sm mb-8">Join the trusted community of UMich students and landlords.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/register" className="inline-flex items-center justify-center bg-[#FFCB05] text-[#00274C] hover:bg-[#FFD42E] font-semibold py-2.5 px-6 rounded-lg border-2 border-[#FFCB05] transition-colors">Create free account</Link>
              <Link href="/listings" className="btn btn-outline">Browse listings</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
