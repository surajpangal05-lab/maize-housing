# 🌽 Maize Housing

A production-quality housing platform for University of Michigan students and Ann Arbor landlords. Built with trust, structured subleasing, and workflow tooling at its core.

## 🚀 Quick Start

```bash
cd ~/maize-housing
npm install
npm run db:seed     # Seed database with test data
npm run dev         # Start development server at http://localhost:3000
```

## 📋 Test Accounts

| Account Type | Email | Password |
|-------------|-------|----------|
| Verified Student | student@umich.edu | password123 |
| Verified Landlord | landlord@example.com | password123 |
| Unverified Student | newstudent@umich.edu | password123 |

## ✨ Core Features

### 1. Verified Identity System

- **Students**: Must verify via @umich.edu email to create listings or contact posters
- **Landlords**: Must verify email + phone for "Verified Landlord" badge
- **Badges displayed on listings**:
  - 🎓 Verified UM Student (yellow)
  - ✅ Verified Landlord (green)
  - Unverified (gray - rare due to posting restrictions)

### 2. Structured Subleasing

Unlike generic platforms like Craigslist/Zillow, listings capture sublease-specific fields:

- **Term tags**: FALL, WINTER, SPRING, SUMMER, FULL_YEAR (multi-select)
- **Academic calendar filters**: Move-in window by week
- **Lease end date**
- **Optional**: Sublease fee, deposit, utilities split notes
- **Sublease Packet Generator**: Downloadable HTML checklist including:
  - Sublease agreement checklist
  - Move-in condition checklist
  - Utilities handoff checklist
  - ⚠️ Labeled as "template/checklist" - no legal advice

### 3. Reputation & Persistence

- After marking a listing "Completed", both parties can leave private feedback:
  - Overall experience (1-5 stars)
  - "Would rent again" yes/no
  - Private notes
- **Public trust indicators**:
  - "X successful transitions"
  - "Last active date"
  - No public star ratings (v1)

### 4. Supply Quality Controls

- **Auto-expiry**: Listings expire after 30 days unless renewed
- **Stale detection**: Prompts renewal if no activity in 14 days
- **Listing limit**: Max 3 active listings per user (prevents spam)
- **Verified listings rank higher** in search results

## 🏗️ Tech Stack

- **Frontend**: Next.js 16 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS 4 with custom UMich color theme
- **Database**: SQLite (Prisma ORM) - easily swap to PostgreSQL for production
- **Auth**: NextAuth.js (beta) with credentials provider
- **Validation**: Zod schemas

## 📁 Project Structure

```
maize-housing/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Test data seeder
│   └── migrations/        # Database migrations
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # Auth endpoints
│   │   │   ├── listings/  # Listings CRUD
│   │   │   ├── messages/  # Messaging
│   │   │   ├── feedback/  # Reputation system
│   │   │   └── user/      # User profile
│   │   ├── dashboard/     # User dashboard
│   │   ├── listings/      # Browse & create listings
│   │   ├── login/         # Sign in
│   │   ├── register/      # Sign up
│   │   ├── messages/      # Message threads
│   │   ├── profile/       # User profile & verification
│   │   └── page.tsx       # Home page
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── ListingCard.tsx
│   │   ├── SearchFilters.tsx
│   │   ├── VerificationBadge.tsx
│   │   ├── SubleasePacketButton.tsx
│   │   ├── FeedbackForm.tsx
│   │   └── MessageThread.tsx
│   └── lib/
│       ├── auth.ts        # Auth configuration
│       ├── prisma.ts      # Database client
│       ├── types.ts       # TypeScript types
│       ├── utils.ts       # Utility functions
│       └── validations.ts # Zod schemas
└── .env                   # Environment variables
```

## 🎨 Design

- **Colors**: UMich Maize (#FFCB05) and Blue (#00274C)
- **Typography**: Instrument Sans
- **UI**: Clean, minimal, fast - focused on trust and usability

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/verify-phone` - Send/verify phone code (landlords)

### Listings
- `GET /api/listings` - Browse with filters
- `POST /api/listings` - Create listing (verified users only)
- `GET /api/listings/[id]` - Get single listing
- `PUT /api/listings/[id]` - Update listing
- `DELETE /api/listings/[id]` - Delete listing
- `PATCH /api/listings/[id]` - Renew/complete/cancel

### Messages
- `GET /api/messages` - Get conversations
- `POST /api/messages` - Send message

### Feedback
- `GET /api/feedback?userId=` - Get user's trust stats
- `POST /api/feedback` - Submit feedback

### User
- `GET /api/user/me` - Get current user
- `PUT /api/user/me` - Update profile
- `GET /api/user/listings` - Get user's listings

## 📝 Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"

# Email (optional - for production)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASSWORD=""
EMAIL_FROM="noreply@maizehousing.com"

# Twilio (optional - for phone verification)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""
```

## 🚀 Production Deployment

1. Switch to PostgreSQL:
   - Update `prisma/schema.prisma` provider to `postgresql`
   - Update `DATABASE_URL` to PostgreSQL connection string

2. Configure email service:
   - Set up SMTP credentials for email verification

3. Configure Twilio:
   - Set up Twilio for phone verification (landlords)

4. Deploy to Vercel/Railway/etc.

## 📄 License

Built for the UMich community. © 2026 Maize Housing.

