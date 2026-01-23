'use client'

import { useState } from 'react'
import { ListingWithUser } from '@/lib/types'

interface SubleasePacketButtonProps {
  listing: ListingWithUser
}

export default function SubleasePacketButton({ listing }: SubleasePacketButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    subleaseeName: '',
    subleaseeEmail: '',
    moveInDate: '',
    moveOutDate: ''
  })
  
  const generatePacket = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/sublease-packet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          ...formData
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Generate and download PDF-like HTML document
        downloadPacket(data.packetData)
      }
    } catch (error) {
      console.error('Error generating packet:', error)
    } finally {
      setLoading(false)
      setIsOpen(false)
    }
  }
  
  const downloadPacket = (packetData: unknown) => {
    const packet = packetData as {
      disclaimer: string
      property: { address: string; city: string; state: string; zipCode: string; propertyType: string; bedrooms: number; bathrooms: number; sqft?: number }
      subleasor: { name: string; email: string; phone: string }
      subleasee: { name: string; email: string }
      dates: { moveIn: string; moveOut: string; leaseEnd: string }
      financial: { monthlyRent: string; deposit: string; subleaseFee: string; utilitiesIncluded: boolean; utilitiesNotes: string }
      subleaseAgreementChecklist: { item: string; checked: boolean }[]
      moveInConditionChecklist: { item: string; checked: boolean }[]
      utilitiesHandoffChecklist: { item: string; checked: boolean }[]
    }
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Sublease Packet - ${listing.address}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, serif; line-height: 1.6; color: #1a1a1a; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 28px; color: #00274C; margin-bottom: 8px; }
    h2 { font-size: 20px; color: #00274C; margin: 32px 0 16px; padding-bottom: 8px; border-bottom: 2px solid #FFCB05; }
    h3 { font-size: 16px; margin: 16px 0 8px; }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 1px solid #e5e5e5; }
    .header img { height: 48px; margin-bottom: 16px; }
    .disclaimer { background: #FEF3C7; padding: 16px; border-radius: 8px; margin-bottom: 32px; font-size: 14px; color: #92400E; }
    .section { margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .field { margin-bottom: 12px; }
    .field-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    .field-value { font-size: 16px; }
    .checklist { list-style: none; }
    .checklist li { padding: 8px 0; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; gap: 12px; }
    .checkbox { width: 20px; height: 20px; border: 2px solid #00274C; border-radius: 4px; flex-shrink: 0; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e5e5; text-align: center; font-size: 12px; color: #666; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎓🏠 MaizeLease</h1>
    <p>Sublease Packet & Checklist</p>
  </div>
  
  <div class="disclaimer">
    <strong>⚠️ Important:</strong> ${packet.disclaimer}
  </div>
  
  <h2>Property Information</h2>
  <div class="grid">
    <div class="field">
      <div class="field-label">Address</div>
      <div class="field-value">${packet.property.address}</div>
    </div>
    <div class="field">
      <div class="field-label">City, State, ZIP</div>
      <div class="field-value">${packet.property.city}, ${packet.property.state} ${packet.property.zipCode}</div>
    </div>
    <div class="field">
      <div class="field-label">Property Type</div>
      <div class="field-value">${packet.property.propertyType}</div>
    </div>
    <div class="field">
      <div class="field-label">Bedrooms / Bathrooms</div>
      <div class="field-value">${packet.property.bedrooms} bed / ${packet.property.bathrooms} bath</div>
    </div>
  </div>
  
  <h2>Parties</h2>
  <div class="grid">
    <div>
      <h3>Subleasor (Current Tenant)</h3>
      <div class="field">
        <div class="field-label">Name</div>
        <div class="field-value">${packet.subleasor.name}</div>
      </div>
      <div class="field">
        <div class="field-label">Email</div>
        <div class="field-value">${packet.subleasor.email}</div>
      </div>
      <div class="field">
        <div class="field-label">Phone</div>
        <div class="field-value">${packet.subleasor.phone}</div>
      </div>
    </div>
    <div>
      <h3>Subleasee (New Tenant)</h3>
      <div class="field">
        <div class="field-label">Name</div>
        <div class="field-value">${packet.subleasee.name}</div>
      </div>
      <div class="field">
        <div class="field-label">Email</div>
        <div class="field-value">${packet.subleasee.email}</div>
      </div>
    </div>
  </div>
  
  <h2>Dates & Financial</h2>
  <div class="grid">
    <div class="field">
      <div class="field-label">Move-in Date</div>
      <div class="field-value">${packet.dates.moveIn}</div>
    </div>
    <div class="field">
      <div class="field-label">Move-out Date</div>
      <div class="field-value">${packet.dates.moveOut}</div>
    </div>
    <div class="field">
      <div class="field-label">Monthly Rent</div>
      <div class="field-value">${packet.financial.monthlyRent}</div>
    </div>
    <div class="field">
      <div class="field-label">Security Deposit</div>
      <div class="field-value">${packet.financial.deposit}</div>
    </div>
    <div class="field">
      <div class="field-label">Sublease Fee</div>
      <div class="field-value">${packet.financial.subleaseFee}</div>
    </div>
    <div class="field">
      <div class="field-label">Utilities</div>
      <div class="field-value">${packet.financial.utilitiesIncluded ? 'Included' : 'Not Included'} - ${packet.financial.utilitiesNotes}</div>
    </div>
  </div>
  
  <h2>Sublease Agreement Checklist</h2>
  <ul class="checklist">
    ${packet.subleaseAgreementChecklist.map(item => `<li><div class="checkbox"></div>${item.item}</li>`).join('')}
  </ul>
  
  <h2>Move-in Condition Checklist</h2>
  <ul class="checklist">
    ${packet.moveInConditionChecklist.map(item => `<li><div class="checkbox"></div>${item.item}</li>`).join('')}
  </ul>
  
  <h2>Utilities Handoff Checklist</h2>
  <ul class="checklist">
    ${packet.utilitiesHandoffChecklist.map(item => `<li><div class="checkbox"></div>${item.item}</li>`).join('')}
  </ul>
  
  <div class="footer">
    <p>Generated by MaizeLease • ${new Date().toLocaleDateString()}</p>
    <p>This document is a template only and does not constitute legal advice.</p>
  </div>
</body>
</html>
    `
    
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sublease-packet-${listing.address.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-outline w-full"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Generate Sublease Packet
      </button>
      
      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 animate-fade-in shadow-2xl">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Generate Sublease Packet
            </h3>
            
            <p className="text-sm text-neutral-500 mb-6">
              Fill in the subleasee&apos;s information to generate a complete checklist packet.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="label">Subleasee Name</label>
                <input
                  type="text"
                  value={formData.subleaseeName}
                  onChange={(e) => setFormData({...formData, subleaseeName: e.target.value})}
                  placeholder="New tenant's name"
                  className="input"
                />
              </div>
              
              <div>
                <label className="label">Subleasee Email</label>
                <input
                  type="email"
                  value={formData.subleaseeEmail}
                  onChange={(e) => setFormData({...formData, subleaseeEmail: e.target.value})}
                  placeholder="newtenant@email.com"
                  className="input"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Move-in Date</label>
                  <input
                    type="date"
                    value={formData.moveInDate}
                    onChange={(e) => setFormData({...formData, moveInDate: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Move-out Date</label>
                  <input
                    type="date"
                    value={formData.moveOutDate}
                    onChange={(e) => setFormData({...formData, moveOutDate: e.target.value})}
                    className="input"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={generatePacket}
                disabled={loading}
                className="btn btn-primary flex-1"
              >
                {loading ? 'Generating...' : 'Download Packet'}
              </button>
            </div>
            
            <p className="mt-4 text-xs text-neutral-400 text-center">
              This is a template/checklist only. It does not constitute legal advice.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
