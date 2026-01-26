export const homeContent = {
  hero: {
    headline: "Housing, Built for Michigan Students",
    subheadline: "Verified listings. Academic-term leases. Zero chaos.",
    description: "The only housing platform designed specifically for UMich students and Ann Arbor landlords. Find your next place with confidence.",
    primaryCTA: {
      text: "Browse Listings",
      href: "/listings",
    },
    secondaryCTA: {
      text: "Post a Listing",
      href: "/listings/create",
    },
    trustBadges: [
      { icon: "shield-check", text: "@umich.edu Verified" },
      { icon: "building", text: "Verified Landlords" },
      { icon: "calendar", text: "Academic Term Filters" },
      { icon: "file-text", text: "Sublease Packet Tools" },
    ],
  },

  problem: {
    headline: "Finding housing shouldn't feel like a gamble",
    description: "Traditional platforms weren't built for students. You deserve better.",
    painPoints: [
      { icon: "user-x", text: "Anonymous posters with no accountability" },
      { icon: "message-circle", text: "Facebook comment thread chaos" },
      { icon: "calendar-x", text: "Lease dates that don't match your semester" },
      { icon: "alert-triangle", text: "Agreements falling apart last minute" },
      { icon: "search", text: "Hours wasted filtering irrelevant listings" },
      { icon: "shield-off", text: "No way to verify who you're dealing with" },
    ],
    cta: {
      text: "Browse verified listings",
      href: "/listings",
    },
  },

  features: {
    headline: "Why MaizeLease",
    subheadline: "Built different, for a reason",
    cards: [
      {
        icon: "shield-check",
        title: "Verified Community",
        description: "Every student verified with @umich.edu email. Every landlord verified with phone + email. Know who you're dealing with.",
      },
      {
        icon: "calendar-check",
        title: "Academic-Term Intelligence",
        description: "Filter by Fall, Winter, Spring/Summer terms. Find leases that actually match your academic schedule.",
      },
      {
        icon: "file-text",
        title: "Structured Subleasing Tools",
        description: "Download professional sublease packets with agreement checklists, move-in logs, and utilities handoff guides.",
      },
      {
        icon: "message-square",
        title: "Direct Messaging",
        description: "Connect directly with verified users. No middlemen, no spam, no games. Just straightforward communication.",
      },
    ],
  },

  howItWorks: {
    headline: "How it works",
    subheadline: "Four simple steps to your next place",
    steps: [
      {
        number: 1,
        title: "Verify",
        description: "Sign up with your @umich.edu email or verify as a landlord with phone + email.",
      },
      {
        number: 2,
        title: "Post or Browse",
        description: "Create a listing with photos and details, or browse verified listings filtered by term.",
      },
      {
        number: 3,
        title: "Connect",
        description: "Message verified users directly. Ask questions, schedule tours, negotiate terms.",
      },
      {
        number: 4,
        title: "Close",
        description: "Use our sublease packet tools to formalize the agreement and handle the handoff.",
      },
    ],
    cta: {
      text: "Create Free Account",
      href: "/register",
    },
  },

  trust: {
    headline: "Trust through verification",
    subheadline: "We verify everyone so you don't have to guess",
    students: {
      title: "For Students",
      requirements: [
        "Valid @umich.edu email address",
        "Email verification link",
        "Instant verification badge",
      ],
      badge: "Verified UM Student",
    },
    landlords: {
      title: "For Landlords",
      requirements: [
        "Valid email address",
        "Phone number verification",
        "Identity confirmation",
      ],
      badge: "Verified Landlord",
    },
    prevents: [
      "Spam and fake listings",
      "Impersonation and scams",
      "Ghosting and no-shows",
      "Anonymous bad actors",
    ],
    disclaimer: "Verification improves trust but does not replace independent due diligence. Always meet in safe public spaces and verify lease terms independently.",
  },

  subleasePacket: {
    headline: "Professional sublease tools",
    subheadline: "Everything you need to sublease with confidence",
    description: "Our sublease packet includes all the documents you need for a smooth transition.",
    items: [
      {
        icon: "clipboard-check",
        title: "Agreement Checklist",
        description: "A comprehensive checklist covering rent, utilities, keys, and responsibilities.",
      },
      {
        icon: "home",
        title: "Move-in Condition Log",
        description: "Document the condition of the space before move-in to protect both parties.",
      },
      {
        icon: "zap",
        title: "Utilities Handoff Guide",
        description: "Step-by-step guide for transferring utilities, internet, and services.",
      },
    ],
    cta: {
      text: "Get the Sublease Packet",
      href: "/sublease-packet",
    },
  },

  testimonials: {
    headline: "What students are saying",
    quotes: [
      {
        text: "Finally, a housing platform that actually understands student schedules. Found my Fall sublease in two days.",
        name: "Sarah M.",
        role: "Engineering Student",
        year: "Class of 2025",
      },
      {
        text: "The verification badges gave me confidence I wasn't dealing with a scammer. Highly recommend.",
        name: "James K.",
        role: "Graduate Student",
        year: "Class of 2026",
      },
      {
        text: "As a landlord, I love that I only get inquiries from verified UMich students. Saves so much time.",
        name: "Patricia L.",
        role: "Property Owner",
        year: "Ann Arbor",
      },
    ],
    // Feature flag - set to false to hide in production until real testimonials
    enabled: true,
  },

  stats: {
    items: [
      { value: "500+", label: "Verified Students" },
      { value: "150+", label: "Listings Posted" },
      { value: "200+", label: "Successful Subleases" },
    ],
    // Feature flag - set to false to hide if metrics not available
    enabled: false,
  },

  faq: {
    headline: "Frequently asked questions",
    subheadline: "Everything you need to know about MaizeLease",
    questions: [
      {
        question: "Who can list on MaizeLease?",
        answer: "Any verified UMich student with a @umich.edu email can post sublease listings. Landlords can also list rentals after completing phone and email verification.",
      },
      {
        question: "How does verification work?",
        answer: "Students verify by confirming their @umich.edu email address. Landlords complete both email and phone verification. This ensures everyone on the platform is accountable.",
      },
      {
        question: "Is MaizeLease free to use?",
        answer: "Yes! MaizeLease is completely free for students and landlords. We believe housing shouldn't have extra barriers.",
      },
      {
        question: "What is a sublease?",
        answer: "A sublease is when the original tenant rents out their space to someone else for a portion of their lease term. This is common when students study abroad or graduate early.",
      },
      {
        question: "Am I still responsible for my lease if I sublease?",
        answer: "Yes, typically the original tenant remains responsible to the landlord. That's why we provide sublease packet tools to help formalize agreements between you and your sublessee.",
      },
      {
        question: "What are academic term filters?",
        answer: "Our term filters let you search by Fall, Winter, Spring, or Summer terms. This helps you find leases that match your actual academic schedule instead of arbitrary 12-month leases.",
      },
      {
        question: "How do I stay safe when meeting someone?",
        answer: "Always meet in public spaces first. Never share financial information before verifying identity. Use our messaging system to keep records. Trust your instincts.",
      },
      {
        question: "What's included in the sublease packet?",
        answer: "Our sublease packet includes an agreement checklist, move-in condition log, and utilities handoff guide. These documents help protect both parties in a sublease arrangement.",
      },
    ],
    cta: {
      text: "Still have questions?",
      href: "/contact",
    },
  },

  finalCTA: {
    headline: "Find housing that fits your academic life",
    description: "Join hundreds of UMich students who've found their perfect place through MaizeLease.",
    primaryCTA: {
      text: "Create Free Account",
      href: "/register",
    },
    secondaryCTA: {
      text: "View Listings",
      href: "/listings",
    },
  },

  navigation: {
    links: [
      { text: "Why", href: "#why" },
      { text: "Features", href: "#features" },
      { text: "How it Works", href: "#how" },
      { text: "FAQ", href: "#faq" },
    ],
  },
}

export type HomeContent = typeof homeContent

