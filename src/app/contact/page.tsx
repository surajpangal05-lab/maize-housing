import Link from 'next/link'

export const metadata = {
  title: 'Contact Us | MaizeLease',
  description: 'Get in touch with the MaizeLease team for questions, feedback, or support.',
}

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-neutral-900 mb-4">Contact Us</h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          Have questions, feedback, or need help? We'd love to hear from you.
        </p>
      </div>

      {/* Contact Card */}
      <div className="card p-8 md:p-12 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-[#FFCB05] to-[#F5B800] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Email Us</h2>
        <p className="text-neutral-600 mb-6">
          For any inquiries, reach out to us at:
        </p>
        
        <a 
          href="mailto:pangal@umich.edu"
          className="inline-flex items-center gap-2 text-xl font-semibold text-[#00274C] hover:text-[#FFCB05] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          pangal@umich.edu
        </a>

        <div className="mt-8 pt-8 border-t border-neutral-100">
          <p className="text-sm text-neutral-500">
            We typically respond within 24-48 hours.
          </p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-12 grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 mb-1">General Questions</h3>
              <p className="text-sm text-neutral-600">
                Questions about listings, verification, or how MaizeLease works.
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 mb-1">Report an Issue</h3>
              <p className="text-sm text-neutral-600">
                Report suspicious listings, scams, or technical problems.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Back Link */}
      <div className="mt-12 text-center">
        <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}

