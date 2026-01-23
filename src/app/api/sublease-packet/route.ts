import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDate, formatCurrency } from '@/lib/utils'

// Generate sublease packet data (client will render PDF)
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { listingId, subleaseeName, subleaseeEmail, moveInDate, moveOutDate } = body

    if (!listingId) {
      return NextResponse.json(
        { success: false, error: 'Listing ID is required' },
        { status: 400 }
      )
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      )
    }

    // Generate the packet data
    const packetData = {
      generatedAt: new Date().toISOString(),
      disclaimer: 'This is a template/checklist only. It does not constitute legal advice. Consult with a legal professional for binding agreements.',
      
      // Property Information
      property: {
        address: listing.address,
        city: listing.city,
        state: listing.state,
        zipCode: listing.zipCode,
        propertyType: listing.propertyType,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        sqft: listing.sqft,
      },
      
      // Parties
      subleasor: {
        name: listing.user.name || 'Not provided',
        email: listing.user.email,
        phone: listing.user.phone || 'Not provided',
      },
      subleasee: {
        name: subleaseeName || 'To be filled',
        email: subleaseeEmail || 'To be filled',
      },
      
      // Dates
      dates: {
        moveIn: moveInDate || formatDate(listing.moveInDate),
        moveOut: moveOutDate || formatDate(listing.leaseEndDate),
        leaseEnd: formatDate(listing.leaseEndDate),
      },
      
      // Financial
      financial: {
        monthlyRent: formatCurrency(listing.rent),
        deposit: listing.deposit ? formatCurrency(listing.deposit) : 'N/A',
        subleaseFee: listing.subleaseFee ? formatCurrency(listing.subleaseFee) : 'N/A',
        utilitiesIncluded: listing.utilitiesIncluded,
        utilitiesNotes: listing.utilitiesNotes || 'Not specified',
      },

      // Checklists
      subleaseAgreementChecklist: [
        { item: 'Original lease allows subleasing', checked: false },
        { item: 'Landlord approval obtained (if required)', checked: false },
        { item: 'Sublease dates clearly specified', checked: false },
        { item: 'Monthly rent amount agreed upon', checked: false },
        { item: 'Security deposit terms defined', checked: false },
        { item: 'Payment method and due dates established', checked: false },
        { item: 'Utilities responsibility assigned', checked: false },
        { item: 'House rules communicated', checked: false },
        { item: 'Early termination terms discussed', checked: false },
        { item: 'Contact information exchanged', checked: false },
      ],

      moveInConditionChecklist: [
        { item: 'Walk-through completed with subleasee', checked: false },
        { item: 'Photos/video of current condition taken', checked: false },
        { item: 'All rooms inspected and documented', checked: false },
        { item: 'Appliances tested and working', checked: false },
        { item: 'Windows and doors functioning properly', checked: false },
        { item: 'Heating/cooling systems tested', checked: false },
        { item: 'Smoke detectors and safety equipment checked', checked: false },
        { item: 'Existing damage documented in writing', checked: false },
        { item: 'Meter readings recorded (if applicable)', checked: false },
        { item: 'Keys and access devices handed over', checked: false },
      ],

      utilitiesHandoffChecklist: [
        { item: 'List all utility accounts', checked: false },
        { item: 'Electric - provider and account transfer', checked: false },
        { item: 'Gas - provider and account transfer', checked: false },
        { item: 'Water - provider and account status', checked: false },
        { item: 'Internet - provider and plan details', checked: false },
        { item: 'Trash/recycling schedule shared', checked: false },
        { item: 'Final meter readings documented', checked: false },
        { item: 'Auto-pay settings reviewed', checked: false },
        { item: 'Utility company contact info shared', checked: false },
        { item: 'Average monthly costs discussed', checked: false },
      ],
    }

    return NextResponse.json({
      success: true,
      packetData,
    })
  } catch (error) {
    console.error('Error generating sublease packet:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate sublease packet' },
      { status: 500 }
    )
  }
}

