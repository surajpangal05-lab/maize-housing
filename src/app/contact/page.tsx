import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Contact Us | MaizeLease',
  description: 'Get in touch with the MaizeLease team for questions, feedback, or support.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Logo */}
        <div className="text-center mb-12">
          <Image
            src="/logo.png"
            alt="MaizeLease"
            width={160}
            height={53}
            className="h-12 w-auto mx-auto grayscale"
          />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-neutral-900 mb-4">Contact Us</h1>
          <p className="text-neutral-600">
            Have questions, feedback, or need help? We'd love to hear from you.
          </p>
        </div>

        {/* Contact Card */}
        <div className="border border-neutral-200 p-12 text-center mb-12">
          <div className="w-16 h-16 border border-neutral-300 flex items-center justify-center mx-auto mb-6">
            <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-serif text-neutral-900 mb-2">Email Us</h2>
          <p className="text-neutral-600 text-sm mb-6">
            For any inquiries, reach out to us at:
          </p>
          
          <a 
            href="mailto:pangal@umich.edu"
            className="inline-flex items-center gap-2 text-lg font-mono text-neutral-900 hover:underline"
          >
            pangal@umich.edu
          </a>

          <div className="mt-8 pt-8 border-t border-neutral-200">
            <p className="text-sm text-neutral-500">
              We typically respond within 24-48 hours.
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-neutral-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 border border-neutral-300 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-neutral-900 mb-1">General Questions</h3>
                <p className="text-sm text-neutral-600">
                  Questions about listings, verification, or how MaizeLease works.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-neutral-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 border border-neutral-300 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-neutral-900 mb-1">Report an Issue</h3>
                <p className="text-sm text-neutral-600">
                  Report suspicious listings, scams, or technical problems.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
