'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  const links = {
    browse: [
      { text: 'All Listings', href: '/listings' },
      { text: 'Subleases', href: '/listings?type=sublease' },
      { text: 'Full Leases', href: '/listings?type=lease' },
    ],
    company: [
      { text: 'How It Works', href: '/#how' },
      { text: 'FAQ', href: '/#faq' },
      { text: 'Contact', href: '/contact' },
    ],
  }

  return (
    <footer className="bg-[#00274C] text-white">
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image 
                src="/logo.png" 
                alt="MaizeLease" 
                width={32} 
                height={32}
                className="h-8 w-auto"
              />
              <span className="font-bold text-lg">
                <span className="text-white">Maize</span>
                <span className="text-[#FFCB05]">Lease</span>
              </span>
            </Link>
            <p className="text-white/60 text-sm max-w-sm mb-4">
              The trusted housing platform for University of Michigan students and Ann Arbor landlords.
            </p>
            <p className="text-white/40 text-xs">
              © {new Date().getFullYear()} MaizeLease. All rights reserved.
            </p>
          </div>

          {/* Browse Links */}
          <div>
            <h4 className="font-semibold text-[#FFCB05] mb-4 text-sm uppercase tracking-wide">Browse</h4>
            <ul className="space-y-2">
              {links.browse.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/70 hover:text-white text-sm transition-colors">
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-[#FFCB05] mb-4 text-sm uppercase tracking-wide">Company</h4>
            <ul className="space-y-2">
              {links.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/70 hover:text-white text-sm transition-colors">
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
