'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-[#00274C] text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <Image src="/logo.png" alt="MaizeLease" width={24} height={24} className="h-6 w-auto" />
          <span className="text-xl font-bold text-[#FFCB05]">MaizeLease</span>
        </Link>
        <p className="text-white/70 text-sm">
          A trusted housing platform exclusively for University of Michigan students
        </p>
        <p className="text-white/50 text-xs mt-4">
          &copy; {new Date().getFullYear()} MaizeLease. Go Blue!
        </p>
      </div>
    </footer>
  )
}
