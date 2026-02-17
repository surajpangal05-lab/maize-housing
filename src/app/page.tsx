import {
  Hero,
  MaizeMaze,
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
      {/* Hero - Full width with Ann Arbor imagery */}
      <Hero />
      
      {/* Features - Why MaizeLease */}
      <FeatureGrid />
      
      {/* Interactive Maize Maze - Unique engagement element */}
      <MaizeMaze />
      
      {/* Problem - Create urgency */}
      <ProblemSection />
      
      {/* How it Works - 4 step timeline */}
      <HowItWorks />
      
      {/* Trust & Verification - Build credibility */}
      <VerificationTrust />
      
      {/* Sublease Packet - Product feature highlight */}
      <SubleasePacket />
      
      {/* Testimonials - Social proof carousel */}
      <Testimonials />
      
      {/* FAQ - Searchable accordion */}
      <FAQAccordion />
      
      {/* Final CTA - Conversion close */}
      <FinalCTA />
    </div>
  )
}
