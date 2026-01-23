import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')
  
  // Create a verified student
  const studentPassword = await bcrypt.hash('password123', 12)
  const student = await prisma.user.upsert({
    where: { email: 'student@umich.edu' },
    update: {},
    create: {
      email: 'student@umich.edu',
      passwordHash: studentPassword,
      name: 'Alex Johnson',
      userType: 'STUDENT',
      isUmichEmail: true,
      emailVerified: new Date(),
      successfulTransitions: 2,
    },
  })
  console.log('✅ Created student:', student.email)
  
  // Create a verified landlord
  const landlordPassword = await bcrypt.hash('password123', 12)
  const landlord = await prisma.user.upsert({
    where: { email: 'landlord@example.com' },
    update: {},
    create: {
      email: 'landlord@example.com',
      passwordHash: landlordPassword,
      name: 'Sarah Miller',
      phone: '+17345551234',
      userType: 'LANDLORD',
      isUmichEmail: false,
      emailVerified: new Date(),
      phoneVerified: new Date(),
      successfulTransitions: 5,
    },
  })
  console.log('✅ Created landlord:', landlord.email)
  
  // Create an unverified student for testing
  const unverifiedPassword = await bcrypt.hash('password123', 12)
  const unverified = await prisma.user.upsert({
    where: { email: 'newstudent@umich.edu' },
    update: {},
    create: {
      email: 'newstudent@umich.edu',
      passwordHash: unverifiedPassword,
      name: 'Jordan Smith',
      userType: 'STUDENT',
      isUmichEmail: true,
      emailVerified: null,
    },
  })
  console.log('✅ Created unverified student:', unverified.email)
  
  // Calculate dates
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const summerStart = new Date('2026-05-01')
  const summerEnd = new Date('2026-08-15')
  const fallStart = new Date('2026-08-25')
  const winterStart = new Date('2027-01-05')
  const winterEnd = new Date('2027-04-25')
  
  // Create listings
  const listings = [
    {
      userId: student.id,
      type: 'SUBLEASE',
      status: 'ACTIVE',
      title: 'Spacious 2BR near Central Campus',
      description: 'Looking for someone to take over my lease this summer! Great location, just a 5-minute walk to the Diag. The apartment has been well-maintained and includes in-unit laundry. Perfect for grad students or upperclassmen. Building has a gym and rooftop access. Quiet neighbors and responsive management.',
      address: '515 E Jefferson St',
      city: 'Ann Arbor',
      state: 'MI',
      zipCode: '48104',
      neighborhood: 'Central Campus',
      propertyType: 'APARTMENT',
      bedrooms: 2,
      bathrooms: 1,
      sqft: 850,
      rent: 1450,
      deposit: 1450,
      subleaseFee: 0,
      utilitiesIncluded: false,
      utilitiesNotes: 'Electric ~$40/mo, Gas ~$30/mo in winter, Water included',
      termTags: 'SUMMER',
      moveInDate: summerStart,
      moveInWindowStart: new Date('2026-04-25'),
      moveInWindowEnd: new Date('2026-05-10'),
      leaseEndDate: summerEnd,
      amenities: JSON.stringify(['In-unit Laundry', 'Gym', 'Rooftop', 'Air Conditioning', 'Parking']),
      images: JSON.stringify([]),
      expiresAt: thirtyDaysFromNow,
      viewCount: 45,
    },
    {
      userId: landlord.id,
      type: 'RENTAL',
      status: 'ACTIVE',
      title: 'Modern Studio in Kerrytown',
      description: 'Brand new renovation! This modern studio features high ceilings, large windows, and premium finishes throughout. Walking distance to the Farmers Market and downtown restaurants. Perfect for a single grad student or young professional. Includes all utilities!',
      address: '407 N Fifth Ave',
      city: 'Ann Arbor',
      state: 'MI',
      zipCode: '48104',
      neighborhood: 'Kerrytown',
      propertyType: 'STUDIO',
      bedrooms: 0,
      bathrooms: 1,
      sqft: 450,
      rent: 1200,
      deposit: 1200,
      subleaseFee: null,
      utilitiesIncluded: true,
      utilitiesNotes: 'All utilities included (water, electric, gas, internet)',
      termTags: 'FALL,WINTER,SPRING,SUMMER,FULL_YEAR',
      moveInDate: fallStart,
      leaseEndDate: winterEnd,
      amenities: JSON.stringify(['Air Conditioning', 'Heating', 'Dishwasher', 'Furnished']),
      images: JSON.stringify([]),
      expiresAt: thirtyDaysFromNow,
      viewCount: 78,
    },
    {
      userId: student.id,
      type: 'SUBLEASE',
      status: 'ACTIVE',
      title: 'Single Room in 4BR House - Burns Park',
      description: 'Subleasing my room in a beautiful house with 3 awesome roommates! All are grad students in engineering. House has a big backyard, updated kitchen, and plenty of parking. 10 min bike ride to North Campus. Utilities split 4 ways.',
      address: '1240 Wells St',
      city: 'Ann Arbor',
      state: 'MI',
      zipCode: '48104',
      neighborhood: 'Burns Park',
      propertyType: 'ROOM',
      bedrooms: 1,
      bathrooms: 2,
      sqft: 180,
      rent: 650,
      deposit: 650,
      subleaseFee: 50,
      utilitiesIncluded: false,
      utilitiesNotes: 'Utilities split 4 ways, usually $60-80/person',
      termTags: 'WINTER,SPRING',
      moveInDate: winterStart,
      leaseEndDate: winterEnd,
      amenities: JSON.stringify(['Parking', 'Pet Friendly', 'On-site Laundry']),
      images: JSON.stringify([]),
      expiresAt: thirtyDaysFromNow,
      viewCount: 23,
    },
    {
      userId: landlord.id,
      type: 'RENTAL',
      status: 'ACTIVE',
      title: '3BR Townhouse - Great for Groups',
      description: 'Spacious townhouse perfect for a group of students or young professionals. Features 3 bedrooms, 2.5 baths, attached garage, and private patio. Located in a quiet neighborhood with easy access to campus via bus. Recently updated with new appliances and flooring.',
      address: '2845 Packard Rd',
      city: 'Ann Arbor',
      state: 'MI',
      zipCode: '48108',
      neighborhood: 'South Campus',
      propertyType: 'TOWNHOUSE',
      bedrooms: 3,
      bathrooms: 2.5,
      sqft: 1400,
      rent: 2400,
      deposit: 2400,
      subleaseFee: null,
      utilitiesIncluded: false,
      utilitiesNotes: 'Tenants pay electric, gas, and internet. Water/trash included.',
      termTags: 'FALL,WINTER,SPRING,FULL_YEAR',
      moveInDate: fallStart,
      leaseEndDate: new Date('2027-07-31'),
      amenities: JSON.stringify(['Parking', 'In-unit Laundry', 'Air Conditioning', 'Dishwasher', 'Balcony']),
      images: JSON.stringify([]),
      expiresAt: thirtyDaysFromNow,
      viewCount: 92,
    },
    {
      userId: student.id,
      type: 'SUBLEASE',
      status: 'ACTIVE',
      title: '1BR in North Campus - Co-op',
      description: 'Cozy 1 bedroom in the North Campus co-op community. Great for anyone interested in sustainable living and community engagement. Shared meals and house responsibilities. Super affordable! Must be approved by house members.',
      address: '1520 Gilbert Ct',
      city: 'Ann Arbor',
      state: 'MI',
      zipCode: '48105',
      neighborhood: 'North Campus',
      propertyType: 'APARTMENT',
      bedrooms: 1,
      bathrooms: 1,
      sqft: 400,
      rent: 550,
      deposit: 550,
      subleaseFee: 0,
      utilitiesIncluded: true,
      utilitiesNotes: 'All utilities and meals included in rent!',
      termTags: 'SUMMER',
      moveInDate: summerStart,
      leaseEndDate: summerEnd,
      amenities: JSON.stringify(['Furnished', 'On-site Laundry', 'Heating']),
      images: JSON.stringify([]),
      expiresAt: thirtyDaysFromNow,
      viewCount: 34,
    },
  ]
  
  for (const listing of listings) {
    await prisma.listing.create({ data: listing })
  }
  console.log(`✅ Created ${listings.length} listings`)
  
  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📋 Test accounts:')
  console.log('   Student (verified): student@umich.edu / password123')
  console.log('   Landlord (verified): landlord@example.com / password123')
  console.log('   Student (unverified): newstudent@umich.edu / password123')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
