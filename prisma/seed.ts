import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const NEIGHBORHOODS = [
  'Central Campus', 'North Campus', 'South Campus', 'Kerrytown', 'Burns Park',
  'Old West Side', 'Water Hill', 'Lower Burns Park', 'Oxbridge',
  'Ann Arbor Hills', 'Barton Hills', 'Georgetown', 'Northside',
  'Broadway', 'State Street', 'South University', 'Division Street',
  'Packard', 'Stadium Area', 'West Side',
]

const STREETS: Record<string, string[]> = {
  'Central Campus': ['515 E Jefferson St', '330 Maynard St', '601 S Forest Ave', '505 E William St', '1100 S University Ave', '220 S State St', '401 E Liberty St', '711 Church St', '808 S State St', '920 E University Ave'],
  'North Campus': ['1520 Gilbert Ct', '2000 Bonisteel Blvd', '2300 Hayward St', '1800 Murfin Ave', '2500 Hubbard St', '1600 Beal Ave', '2200 Fuller Rd', '1900 Baxter Rd', '2100 Plymouth Rd', '1700 Broadway St'],
  'South Campus': ['2845 Packard Rd', '1400 Geddes Ave', '1600 Washtenaw Ave', '2100 S Main St', '1800 Hill St', '2000 Packard St', '1200 S Forest Ave', '2400 Pittsfield Blvd', '1500 Stadium Blvd', '2600 Carpenter Rd'],
  'Kerrytown': ['407 N Fifth Ave', '315 Detroit St', '210 N Fourth Ave', '501 Kingsley St', '120 W Summit St', '225 N Ashley St', '400 N Main St', '310 N First St', '115 Catherine St', '520 N Division St'],
  'Burns Park': ['1240 Wells St', '1015 Granger Ave', '1330 Cambridge Rd', '1120 Baldwin Ave', '1450 Morton Ave', '1200 Olivia Ave', '1050 Lincoln Ave', '1380 Brooklyn Ave', '1500 Packard St', '1100 Ferdon Rd'],
  'Old West Side': ['520 W Huron St', '315 S Ashley St', '410 W Washington St', '225 S First St', '600 W Liberty St', '130 S Seventh St', '340 Spring St', '450 W Madison St', '210 Mulholland Ave', '515 Crest Ave'],
  'Water Hill': ['800 Sunset Rd', '615 Gott St', '420 Spring St', '710 Miller Ave', '530 Fountain St', '320 Hiscock St', '440 N Maple Rd', '250 Felch St', '600 W Huron St', '350 N Ashley St'],
  'Lower Burns Park': ['1000 Packard St', '850 S State St', '920 E Madison St', '1100 White St', '780 Arch St', '1050 Martin Pl', '900 Woodlawn Ave', '1150 Prospect St', '830 Elm St', '960 Hill St'],
  'Oxbridge': ['2200 Medford Rd', '2050 Devonshire Rd', '2300 Oxford Rd', '2100 Cambridge Blvd', '2400 Londonderry Rd', '2150 Stratford Rd', '2350 Hampshire Ct', '2000 Dorchester Rd', '2250 Brockman Blvd', '2450 Chesterfield Dr'],
  'Ann Arbor Hills': ['1800 Heatherway', '1650 Scottwood Ave', '1900 Tuomy Rd', '1750 Arlington Blvd', '2000 Belmont Rd', '1850 Vinewood Blvd', '1700 Shadford Rd', '1950 Geddes Ave', '1600 Berkshire Rd', '2050 Washtenaw Ave'],
  'Barton Hills': ['300 Barton Shore Dr', '450 Barton Dr', '200 Pontiac Trail', '550 Huron River Dr', '150 Riverview Dr', '400 Sunset Rd', '250 Hillcrest Dr', '500 Barton Rd', '350 Lakeview Dr', '100 Woodland Dr'],
  'Georgetown': ['3100 Williamsburg Ct', '3200 Williamsburg Dr', '3050 Georgetown Blvd', '3150 Berkshire Dr', '3300 Brentwood Ct', '3250 Canterbury Rd', '3000 Georgetown Ct', '3350 Foxcroft Rd', '3400 Briarwood Cir', '3175 Windsor Ct'],
  'Northside': ['1200 Pontiac Trail', '1050 Jones Dr', '1350 Traver Rd', '1100 Dhu Varren Rd', '1400 Pear St', '1250 Starwick Dr', '1500 Green Rd', '1150 Covington Dr', '1300 Orkney Dr', '1450 Chalmers Dr'],
  'Broadway': ['1600 Broadway St', '1450 Plymouth Rd', '1750 Maiden Ln', '1550 Broadway Blvd', '1700 Wall St', '1500 Beakes St', '1650 Depot St', '1800 Swift St', '1400 Traver St', '1350 Moore St'],
  'State Street': ['200 S State St', '415 E Huron St', '310 S State St', '525 E Washington St', '150 E Liberty St', '430 S State St', '600 E Huron St', '250 Thompson St', '350 Maynard St', '500 E William St'],
  'South University': ['1020 S University Ave', '830 S University Ave', '1200 Washtenaw Ave', '950 S University Ave', '1100 E University Ave', '750 S University Ave', '1300 Hill St', '880 S University Ave', '1150 Geddes Ave', '700 S University Ave'],
  'Division Street': ['400 S Division St', '550 E Madison St', '300 S Division St', '650 E Kingsley St', '200 S Division St', '500 E Ann St', '350 E Huron St', '450 E Washington St', '250 E Liberty St', '600 E William St'],
  'Packard': ['2100 Packard Rd', '2300 Packard St', '2500 Eisenhower Pkwy', '2200 Platt Rd', '2400 Stone School Rd', '2050 Brockman Blvd', '2350 Yost Blvd', '2150 Easy St', '2450 Ellsworth Rd', '2000 Arbordale St'],
  'Stadium Area': ['1000 S Main St', '1200 Stadium Blvd', '850 Pauline Blvd', '1100 W Stadium Blvd', '950 Seventh St', '1300 W Hoover Ave', '800 Keech Ave', '1150 Edgewood Ave', '1050 Pomona Rd', '900 Hutchins Ave'],
  'West Side': ['2500 W Stadium Blvd', '2300 Jackson Ave', '2700 Dexter Ave', '2400 Maple Rd', '2600 Miller Ave', '2200 Scio Church Rd', '2800 Wagner Rd', '2350 Pauline Blvd', '2550 Liberty Rd', '2450 W Huron St'],
}

const ZIP_CODES: Record<string, string> = {
  'Central Campus': '48104', 'North Campus': '48105', 'South Campus': '48108',
  'Kerrytown': '48104', 'Burns Park': '48104', 'Old West Side': '48103',
  'Water Hill': '48103', 'Lower Burns Park': '48104', 'Oxbridge': '48104',
  'Ann Arbor Hills': '48104', 'Barton Hills': '48105', 'Georgetown': '48108',
  'Northside': '48105', 'Broadway': '48105', 'State Street': '48104',
  'South University': '48104', 'Division Street': '48104', 'Packard': '48108',
  'Stadium Area': '48103', 'West Side': '48103',
}

const PROPERTY_TYPES = ['APARTMENT', 'HOUSE', 'ROOM', 'STUDIO', 'TOWNHOUSE'] as const
const TERM_COMBOS = [
  'SUMMER', 'FALL', 'WINTER', 'SPRING', 'FULL_YEAR',
  'FALL,WINTER', 'WINTER,SPRING', 'SPRING,SUMMER', 'FALL,WINTER,SPRING',
  'FALL,WINTER,SPRING,SUMMER,FULL_YEAR',
]

const AMENITY_POOL = [
  'Wi-Fi', 'Kitchen', 'Pet Friendly', 'Air Conditioning', 'Laundry',
  'Parking', 'Furnished', 'Heating', 'Dishwasher', 'Gym',
  'Pool', 'Balcony', 'Rooftop', 'Storage', 'Bike Storage',
  'EV Charging', 'Doorman', 'Package Room',
]

const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery',
  'Cameron', 'Peyton', 'Skyler', 'Dakota', 'Reese', 'Finley', 'Emerson', 'Rowan',
  'Hayden', 'Parker', 'Sage', 'Blake', 'Jamie', 'Drew', 'Logan', 'Kendall',
  'Harper', 'Addison', 'Charlie', 'Elliot', 'Frankie', 'Jesse', 'Kai', 'Lane',
  'Micah', 'Nico', 'Oakley', 'Phoenix', 'Remy', 'Sam', 'Tatum', 'Val',
  'Wren', 'Zion', 'Ari', 'Bay', 'Corey', 'Devon', 'Eden', 'Flynn', 'Gray', 'Harley',
]

const LAST_NAMES = [
  'Johnson', 'Williams', 'Chen', 'Patel', 'Kim', 'Garcia', 'Lee', 'Brown',
  'Miller', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson',
  'White', 'Harris', 'Martin', 'Thompson', 'Robinson', 'Clark', 'Lewis', 'Walker',
  'Hall', 'Young', 'Allen', 'King', 'Wright', 'Lopez', 'Hill', 'Scott',
  'Green', 'Adams', 'Baker', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts',
  'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart',
  'Sanchez', 'Morris',
]

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickN<T>(arr: readonly T[], min: number, max: number): T[] {
  const n = min + Math.floor(Math.random() * (max - min + 1))
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randFloat(min: number, max: number, step: number): number {
  const steps = Math.round((max - min) / step)
  return min + Math.floor(Math.random() * (steps + 1)) * step
}

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 86400000)
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function generateTitle(propType: string, bedrooms: number, neighborhood: string, type: string): string {
  const adjectives = ['Spacious', 'Cozy', 'Modern', 'Bright', 'Charming', 'Updated', 'Sunny', 'Beautiful', 'Lovely', 'Clean', 'Quiet', 'Renovated', 'Stylish', 'Affordable', 'Comfortable', 'Well-maintained', 'Gorgeous', 'Stunning', 'Great', 'Amazing']
  const adj = pick(adjectives)
  const bed = bedrooms === 0 ? 'Studio' : `${bedrooms}BR`
  const propLabel = propType === 'ROOM' ? 'Room' : propType === 'STUDIO' ? 'Studio' : propType === 'TOWNHOUSE' ? 'Townhouse' : propType === 'HOUSE' ? 'House' : 'Apt'

  const templates = [
    `${adj} ${bed} ${propLabel} in ${neighborhood}`,
    `${adj} ${bed} near ${neighborhood}`,
    `${bed} ${propLabel} - ${neighborhood}`,
    `${adj} ${bed} ${propLabel} - Walk to Campus`,
    `${bed} in ${neighborhood} - ${adj}!`,
    `${neighborhood} ${bed} ${propLabel} - Must See`,
    `${adj} ${bed} ${propLabel} Available Now`,
    `${bed} ${propLabel} in ${neighborhood} - Great Location`,
  ]

  if (type === 'SUBLEASE') {
    templates.push(
      `Summer Sublease: ${adj} ${bed} in ${neighborhood}`,
      `${bed} Sublease - ${neighborhood}`,
      `Looking for Subletter: ${adj} ${bed}`,
      `${adj} ${bed} Sublease near Campus`,
    )
  }

  return pick(templates)
}

function generateDescription(propType: string, bedrooms: number, neighborhood: string, type: string, rent: number, amenities: string[]): string {
  const intros = type === 'SUBLEASE' ? [
    `Looking for someone to take over my lease!`,
    `Subleasing my place for the upcoming term.`,
    `Need someone to sublease my spot.`,
    `Available for sublease starting soon!`,
    `Seeking a subletter for my ${propType.toLowerCase()}.`,
    `I'm graduating and need someone to take over my lease.`,
    `Study abroad coming up - need a subletter!`,
    `Moving out early and looking for someone to take over.`,
  ] : [
    `Beautiful ${propType.toLowerCase()} available for rent.`,
    `Now leasing this ${propType.toLowerCase()} in ${neighborhood}.`,
    `Great rental opportunity in ${neighborhood}!`,
    `Available for the upcoming academic year.`,
    `Well-maintained ${propType.toLowerCase()} ready for move-in.`,
    `Professionally managed ${propType.toLowerCase()} in a great location.`,
  ]

  const locationDescs = [
    `Located in ${neighborhood}, just minutes from campus.`,
    `Great ${neighborhood} location with easy access to everything.`,
    `Prime ${neighborhood} spot - walk to class, restaurants, and shops.`,
    `Situated in the heart of ${neighborhood}.`,
    `Convenient ${neighborhood} location near bus routes and campus.`,
    `${neighborhood} area with great walkability.`,
    `Steps from ${neighborhood}'s best restaurants and cafes.`,
    `Quiet ${neighborhood} street but close to everything.`,
  ]

  const featureDescs: string[] = []
  if (amenities.includes('Furnished')) featureDescs.push('Comes fully furnished - just bring your bags!')
  if (amenities.includes('Parking')) featureDescs.push('Includes a dedicated parking spot.')
  if (amenities.includes('Laundry') || amenities.includes('In-unit Laundry')) featureDescs.push('Laundry available on-site.')
  if (amenities.includes('Air Conditioning')) featureDescs.push('Central A/C keeps you cool in summer.')
  if (amenities.includes('Pet Friendly')) featureDescs.push('Pet-friendly - cats and small dogs welcome!')
  if (amenities.includes('Gym')) featureDescs.push('Building gym included with rent.')
  if (amenities.includes('Balcony')) featureDescs.push('Private balcony with great views.')
  if (amenities.includes('Dishwasher')) featureDescs.push('Updated kitchen with dishwasher.')

  const closings = [
    `Don't miss out - reach out today!`,
    `Schedule a viewing anytime.`,
    `Message me with any questions!`,
    `Serious inquiries only please.`,
    `Available for virtual or in-person tours.`,
    `Won't last long at this price!`,
    `Perfect for students or young professionals.`,
    `Great value for the ${neighborhood} area.`,
  ]

  const parts = [
    pick(intros),
    pick(locationDescs),
    ...(featureDescs.length > 0 ? [pickN(featureDescs, 1, Math.min(3, featureDescs.length)).join(' ')] : []),
    `Rent is $${rent}/month.`,
    pick(closings),
  ]

  return parts.join(' ')
}

async function main() {
  console.log('Seeding database with 200+ listings...\n')

  const password = await bcrypt.hash('password123', 12)

  const usersToCreate = []
  for (let i = 0; i < 40; i++) {
    const first = pick(FIRST_NAMES)
    const last = pick(LAST_NAMES)
    const isStudent = i < 30
    const email = isStudent
      ? `${first.toLowerCase()}${last.toLowerCase()}${randInt(1, 99)}@umich.edu`
      : `${first.toLowerCase()}.${last.toLowerCase()}${randInt(1, 99)}@gmail.com`

    usersToCreate.push({
      email,
      passwordHash: password,
      name: `${first} ${last}`,
      userType: isStudent ? 'STUDENT' : 'LANDLORD',
      isUmichEmail: isStudent,
      emailVerified: new Date(),
      phoneVerified: isStudent ? null : new Date(),
      phone: isStudent ? null : `+1734555${String(randInt(1000, 9999))}`,
      successfulTransitions: randInt(0, 8),
    })
  }

  const users = []
  for (const u of usersToCreate) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    })
    users.push(user)
  }
  console.log(`Created ${users.length} users`)

  const summerStart = new Date('2026-05-01')
  const summerEnd = new Date('2026-08-15')
  const fallStart = new Date('2026-08-25')
  const fallEnd = new Date('2026-12-15')
  const winterStart = new Date('2027-01-05')
  const winterEnd = new Date('2027-04-25')
  const springStart = new Date('2027-05-01')
  const springEnd = new Date('2027-06-30')
  const fullYearEnd = new Date('2027-07-31')

  const dateRanges = [
    { move: summerStart, end: summerEnd },
    { move: fallStart, end: fallEnd },
    { move: fallStart, end: winterEnd },
    { move: fallStart, end: fullYearEnd },
    { move: winterStart, end: winterEnd },
    { move: winterStart, end: springEnd },
    { move: springStart, end: springEnd },
    { move: summerStart, end: fullYearEnd },
  ]

  const rentRanges: Record<string, [number, number]> = {
    ROOM: [450, 900],
    STUDIO: [800, 1400],
    APARTMENT_1: [900, 1700],
    APARTMENT_2: [1200, 2400],
    APARTMENT_3: [1800, 3200],
    HOUSE: [2000, 4500],
    TOWNHOUSE: [1600, 3500],
  }

  const listings = []
  for (let i = 0; i < 210; i++) {
    const neighborhood = pick(NEIGHBORHOODS)
    const streets = STREETS[neighborhood]
    const address = pick(streets)
    const zipCode = ZIP_CODES[neighborhood]
    const user = pick(users)
    const isStudent = user.userType === 'STUDENT'
    const type = isStudent ? (Math.random() < 0.85 ? 'SUBLEASE' : 'RENTAL') : 'RENTAL'
    const propType = pick(PROPERTY_TYPES)

    let bedrooms: number
    let bathrooms: number
    let sqft: number | null
    let rentKey: string

    switch (propType) {
      case 'STUDIO':
        bedrooms = 0; bathrooms = 1; sqft = randInt(300, 550); rentKey = 'STUDIO'; break
      case 'ROOM':
        bedrooms = 1; bathrooms = pick([1, 1, 1.5, 2]); sqft = randInt(120, 250); rentKey = 'ROOM'; break
      case 'TOWNHOUSE':
        bedrooms = randInt(2, 4); bathrooms = randFloat(1.5, 3.5, 0.5); sqft = randInt(1000, 2000); rentKey = 'TOWNHOUSE'; break
      case 'HOUSE':
        bedrooms = randInt(2, 6); bathrooms = randFloat(1, 4, 0.5); sqft = randInt(1200, 3000); rentKey = 'HOUSE'; break
      default: {
        bedrooms = randInt(1, 4)
        bathrooms = randFloat(1, 2.5, 0.5)
        sqft = randInt(500, 1500)
        rentKey = bedrooms <= 1 ? 'APARTMENT_1' : bedrooms === 2 ? 'APARTMENT_2' : 'APARTMENT_3'
      }
    }

    const [minRent, maxRent] = rentRanges[rentKey]
    const rent = Math.round(randInt(minRent, maxRent) / 25) * 25

    const deposit = Math.random() < 0.7 ? rent : Math.round(rent * randFloat(0.5, 1.5, 0.25))
    const subleaseFee = type === 'SUBLEASE' && Math.random() < 0.3 ? randInt(0, 100) : null
    const utilitiesIncluded = Math.random() < 0.25
    const utilitiesNotes = utilitiesIncluded
      ? pick(['All utilities included', 'Water, electric, gas, and internet included', 'All utilities and Wi-Fi included in rent'])
      : pick([
          'Electric ~$40/mo, Gas ~$30/mo in winter',
          'Utilities split between tenants, usually $50-80/person',
          'Tenants pay electric and internet. Water included.',
          'Electric and gas not included. Budget ~$100/mo total.',
          'Water/trash included. Tenants pay electric, gas, internet.',
          null,
        ])

    const termTags = pick(TERM_COMBOS)
    const dateRange = pick(dateRanges)
    const moveInDate = randomDate(new Date(dateRange.move.getTime() - 7 * 86400000), new Date(dateRange.move.getTime() + 14 * 86400000))
    const leaseEndDate = dateRange.end

    const amenities = pickN(AMENITY_POOL, 2, 7)
    const title = generateTitle(propType, bedrooms, neighborhood, type)
    const description = generateDescription(propType, bedrooms, neighborhood, type, rent, amenities)

    const createdAt = randomDate(daysFromNow(-60), daysFromNow(-1))
    const viewCount = randInt(5, 300)

    listings.push({
      userId: user.id,
      type,
      status: 'ACTIVE',
      title,
      description,
      address,
      city: 'Ann Arbor',
      state: 'MI',
      zipCode,
      neighborhood,
      propertyType: propType,
      bedrooms,
      bathrooms,
      sqft,
      rent,
      deposit,
      subleaseFee,
      utilitiesIncluded,
      utilitiesNotes,
      termTags,
      moveInDate,
      moveInWindowStart: Math.random() < 0.4 ? new Date(moveInDate.getTime() - 7 * 86400000) : null,
      moveInWindowEnd: Math.random() < 0.4 ? new Date(moveInDate.getTime() + 7 * 86400000) : null,
      leaseEndDate,
      amenities: JSON.stringify(amenities),
      images: JSON.stringify([]),
      expiresAt: daysFromNow(randInt(15, 60)),
      createdAt,
      updatedAt: createdAt,
      lastActivityAt: randomDate(createdAt, new Date()),
      viewCount,
    })
  }

  for (const listing of listings) {
    await prisma.listing.create({ data: listing })
  }
  console.log(`Created ${listings.length} listings`)

  console.log('\nDatabase seeded successfully!')
  console.log(`\nTotal: ${users.length} users, ${listings.length} listings`)
  console.log('\nAll test accounts use password: password123')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
