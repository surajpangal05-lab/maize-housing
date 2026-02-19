import Link from 'next/link'

export const metadata = {
  title: 'Contact Us | MaizeLease',
  description: 'Get in touch with the MaizeLease team for questions, feedback, or support.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#00274C] py-16">
        <div className="container">
          <h1 className="text-white mb-4">Contact Us</h1>
          <p className="text-white/70 text-lg">
            Have questions, feedback, or need help? We'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          {/* Main Contact Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#FFCB05] flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-[#00274C] mb-2">Email Us</h2>
            <p className="text-gray-600 mb-6">
              For any inquiries, reach out to us at:
            </p>
            
            <a 
              href="mailto:pangal@umich.edu"
              className="text-lg font-semibold text-[#00274C] hover:text-[#FFCB05] transition-colors"
            >
              pangal@umich.edu
            </a>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                We typically respond within 24-48 hours.
              </p>
            </div>
          </div>

          {/* Help Categories */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#00274C]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#00274C] mb-1">General Questions</h3>
                  <p className="text-sm text-gray-600">
                    Questions about listings, verification, or how MaizeLease works.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#00274C]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#00274C] mb-1">Report an Issue</h3>
                  <p className="text-sm text-gray-600">
                    Report suspicious listings, scams, or technical problems.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Back Link */}
          <div className="text-center mt-8">
            <Link href="/" className="text-gray-500 hover:text-[#00274C] text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
