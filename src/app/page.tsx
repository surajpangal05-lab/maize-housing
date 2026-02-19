import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { scraperPrisma } from '@/lib/scraper-db'

export const revalidate = 86400

type FeaturedListing = {
  id: string
  title: string
  type: string
  rent: number
  bedrooms: number
  bathrooms: number
  neighborhood: string | null
  city: string | null
  state: string | null
  propertyType: string | null
  images: string | null
  userName: string | null
}

async function getFeaturedListing(): Promise<FeaturedListing | null> {
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)

  // Try main DB first
  try {
    const count = await prisma.listing.count({ where: { status: 'ACTIVE' } })
    if (count > 0) {
      const listing = await prisma.listing.findFirst({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        skip: dayOfYear % count,
        include: { user: { select: { name: true, email: true } } },
      })
      if (listing) {
        return {
          id: listing.id,
          title: listing.title,
          type: listing.type,
          rent: listing.rent,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          neighborhood: listing.neighborhood,
          city: listing.city,
          state: listing.state,
          propertyType: listing.propertyType,
          images: listing.images,
          userName: listing.user?.name || listing.user?.email?.split('@')[0] || null,
        }
      }
    }
  } catch { /* fall through to scraped */ }

  // Fallback: scraped listings DB
  try {
    const count = await scraperPrisma.listing.count()
    if (count === 0) return null

    const listing = await scraperPrisma.listing.findFirst({
      orderBy: { createdAt: 'desc' },
      skip: dayOfYear % count,
      include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
    })
    if (!listing) return null

    const imgUrl = listing.images?.[0]?.originalUrl || listing.images?.[0]?.storedUrl || null

    return {
      id: `scraped_${listing.id}`,
      title: listing.title || (listing.beds ? `${listing.beds} BR` : 'Rental') + (listing.city ? ` in ${listing.city}` : ''),
      type: 'RENTAL',
      rent: listing.priceMin || listing.priceMax || 0,
      bedrooms: listing.beds || 0,
      bathrooms: listing.baths || 0,
      neighborhood: null,
      city: listing.city,
      state: listing.state,
      propertyType: listing.propertyType?.toUpperCase() || null,
      images: imgUrl ? JSON.stringify([imgUrl]) : null,
      userName: null,
    }
  } catch {
    return null
  }
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents)
}

export default async function Home() {
  const featured = await getFeaturedListing()

  let featuredImage: string | null = null
  if (featured?.images) {
    try {
      const imgs = JSON.parse(featured.images)
      if (Array.isArray(imgs) && imgs.length > 0) featuredImage = imgs[0]
    } catch { /* ignore */ }
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#00274C] via-[#003D6E] to-[#00274C] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#FFCB05]/20 text-[#FFCB05] px-4 py-2 rounded-full mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                <span className="text-sm font-semibold">Verified Michigan Students Only</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight" style={{ color: '#FFFFFF' }}>
                Find Your Perfect
                <span className="block" style={{ color: '#FFCB05' }}>Michigan Home</span>
              </h1>

              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                The trusted platform connecting University of Michigan students with verified subleases and rental properties. Safe, simple, and exclusively for Wolverines.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/listings" className="btn btn-lg bg-[#FFCB05] text-[#00274C] hover:bg-[#FFD42E] text-lg px-8">
                  Browse Listings
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
                <Link href="/listings/create" className="btn btn-lg btn-outline-white text-lg px-8">
                  Post Your Listing
                </Link>
              </div>

              <div className="mt-12 flex items-center gap-8 text-sm">
                <div>
                  <div className="text-3xl font-bold text-[#FFCB05]">500+</div>
                  <div className="text-white/60">Active Listings</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#FFCB05]">2,000+</div>
                  <div className="text-white/60">Students Helped</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#FFCB05]">100%</div>
                  <div className="text-white/60">Verified Users</div>
                </div>
              </div>
            </div>

            {/* Featured Listing Card */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-[#FFCB05]/20 rounded-3xl blur-2xl" />
                {featured ? (
                  <Link href={`/listings/${featured.id}`} className="block relative">
                    <div className="relative rounded-2xl shadow-2xl w-full overflow-hidden bg-white group">
                      {/* Image */}
                      <div className="h-52 bg-gradient-to-br from-[#003D6E] to-[#00274C] overflow-hidden">
                        {featuredImage ? (
                          <img src={featuredImage} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-[#FFCB05] text-[#00274C]">
                            ★ Featured Today
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full text-white ${featured.type === 'SUBLEASE' ? 'bg-blue-600' : 'bg-green-600'}`}>
                            {featured.type === 'SUBLEASE' ? 'Sublease' : 'Rental'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-[#00274C] line-clamp-1 flex-1 mr-3">{featured.title}</h3>
                          <span className="text-xl font-bold text-[#00274C] whitespace-nowrap">
                            {formatPrice(featured.rent)}<span className="text-sm font-normal text-gray-500">/mo</span>
                          </span>
                        </div>

                        <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-3">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {featured.neighborhood || featured.city || 'Ann Arbor'}, {featured.state || 'MI'}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            {featured.bedrooms} bed
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            {featured.bathrooms} bath
                          </span>
                          {featured.propertyType && (
                            <span className="text-gray-400">{featured.propertyType.charAt(0) + featured.propertyType.slice(1).toLowerCase()}</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-400">
                            Posted by {featured.userName || 'Verified User'}
                          </span>
                          <span className="text-sm font-semibold text-[#00274C] group-hover:text-[#003D6E] transition-colors flex items-center gap-1">
                            View Listing
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="relative rounded-2xl shadow-2xl w-full h-[400px] bg-gradient-to-br from-[#003D6E] to-[#00274C] flex items-center justify-center overflow-hidden">
                    <div className="text-center p-8">
                      <div className="w-20 h-20 bg-[#FFCB05] rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                      </div>
                      <p className="text-white text-lg font-medium">Your next home awaits</p>
                      <p className="text-white/50 text-sm mt-2">Verified listings near campus</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto">
            <path fill="#F9FAFB" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#00274C] mb-4">Why Choose MaizeLease?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">The only housing platform built exclusively for the Michigan community</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <svg className="w-8 h-8 text-[#FFCB05]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, title: '100% Verified', desc: 'Every user is verified with a @umich.edu email. No scammers, no fake listings—just trusted Wolverines.' },
              { icon: <svg className="w-8 h-8 text-[#FFCB05]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>, title: 'Easy Search', desc: 'Find exactly what you need with powerful filters by price, location, bedrooms, and listing type.' },
              { icon: <svg className="w-8 h-8 text-[#FFCB05]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>, title: 'Direct Contact', desc: 'Connect directly with landlords and students. No middleman fees, no complicated processes.' },
            ].map(f => (
              <div key={f.title} className="bg-white border-2 border-gray-200 rounded-xl p-8 text-center hover:border-[#FFCB05] hover:shadow-lg transition-all">
                <div className="w-16 h-16 bg-[#00274C] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#00274C]">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#00274C] mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Find or post housing in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { num: '1', title: 'Browse or Post', desc: 'Search through verified listings or post your own sublease or rental property' },
              { num: '2', title: 'Connect', desc: 'Reach out directly to posters through our secure contact system' },
              { num: '3', title: 'Move In', desc: 'Schedule viewings, finalize details, and move into your perfect Michigan home' },
            ].map(step => (
              <div key={step.num} className="text-center">
                <div className="w-20 h-20 bg-[#FFCB05] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-[#00274C]">
                  {step.num}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-[#00274C]">{step.title}</h3>
                <p className="text-gray-600 text-lg">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-r from-[#00274C] to-[#003D6E] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Loved by Michigan Students</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { text: 'Found my perfect sublease for summer in just 2 days! Everyone is verified so I felt totally safe.', name: 'Sarah M., Junior' },
              { text: 'As a landlord, this platform helped me find responsible Michigan students quickly. Much better than other sites!', name: 'James L., Property Owner' },
              { text: "Super easy to use and I love that it's only for Michigan students. Found amazing roommates!", name: 'Alex K., Sophomore' },
            ].map(t => (
              <div key={t.name} className="bg-white/10 border border-white/20 backdrop-blur rounded-xl p-6">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg key={star} className="w-5 h-5 fill-[#FFCB05] text-[#FFCB05]" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-white mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                <p className="text-[#FFCB05] font-semibold">- {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <svg className="w-16 h-16 text-[#FFCB05] mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <h2 className="text-4xl font-bold text-[#00274C] mb-6">Ready to Find Your Home?</h2>
          <p className="text-xl text-gray-600 mb-8">Join thousands of Michigan students finding trusted housing</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/listings" className="btn btn-lg btn-secondary text-lg px-8">
              Browse All Listings
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <Link href="/listings/create" className="btn btn-lg btn-outline text-lg px-8">
              Post a Listing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
