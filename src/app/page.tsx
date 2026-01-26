import {
  Hero,
  ProblemSection,
  FeatureGrid,
  HowItWorks,
  VerificationTrust,
  SubleasePacket,
  Testimonials,
  FAQAccordion,
  FinalCTA,
} from '@/components/marketing'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero - Above the fold conversion section */}
      <Hero />
      
      {/* Problem - Create urgency */}
      <ProblemSection />
      
      {/* Features - 4 card grid */}
      <FeatureGrid />
      
      {/* How it Works - 4 step process */}
      <HowItWorks />
      
      {/* Trust & Verification - Build credibility */}
      <VerificationTrust />
      
      {/* Sublease Packet - Product feature highlight */}
      <SubleasePacket />
      
      {/* Testimonials - Social proof (feature flagged) */}
      <Testimonials />
      
      {/* FAQ - Answer common questions */}
      <FAQAccordion />
      
      {/* Final CTA - Conversion close */}
      <FinalCTA />
      
      {/* Add bottom padding on mobile for fixed CTA bar */}
      <div className="h-20 md:hidden" />
    </div>
  )
}
