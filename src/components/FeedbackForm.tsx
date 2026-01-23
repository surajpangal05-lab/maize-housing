'use client'

import { useState } from 'react'

interface FeedbackFormProps {
  listingId: string
  receiverId: string
  onSuccess?: () => void
}

export default function FeedbackForm({ listingId, receiverId, onSuccess }: FeedbackFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [wouldRentAgain, setWouldRentAgain] = useState<boolean | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      setError('Please select a rating')
      return
    }
    
    if (wouldRentAgain === null) {
      setError('Please answer "Would you rent again?"')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          receiverId,
          overallRating: rating,
          wouldRentAgain,
          notes: notes.trim() || undefined
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccess(true)
        onSuccess?.()
      } else {
        setError(data.error || 'Failed to submit feedback')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }
  
  if (success) {
    return (
      <div className="alert alert-success text-center">
        <svg className="w-12 h-12 text-green-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="font-semibold mb-1">Feedback Submitted!</h3>
        <p className="text-sm opacity-80">Thank you for helping build trust in our community.</p>
      </div>
    )
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      {/* Rating */}
      <div>
        <label className="label">Overall Experience</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <svg 
                className={`w-8 h-8 ${
                  star <= (hoverRating || rating)
                    ? 'text-[#FFCB05] fill-[#FFCB05]'
                    : 'text-neutral-300'
                }`}
                fill="none"
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          {rating === 0 ? 'Click to rate' : `${rating} out of 5 stars`}
        </p>
      </div>
      
      {/* Would Rent Again */}
      <div>
        <label className="label">Would you rent from/to this person again?</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setWouldRentAgain(true)}
            className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
              wouldRentAgain === true
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-neutral-200 hover:border-neutral-300 bg-white'
            }`}
          >
            👍 Yes
          </button>
          <button
            type="button"
            onClick={() => setWouldRentAgain(false)}
            className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
              wouldRentAgain === false
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-neutral-200 hover:border-neutral-300 bg-white'
            }`}
          >
            👎 No
          </button>
        </div>
      </div>
      
      {/* Notes */}
      <div>
        <label className="label">Private Notes <span className="text-neutral-400 font-normal">(optional)</span></label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional thoughts about your experience..."
          rows={3}
          maxLength={1000}
          className="input"
        />
        <p className="mt-1 text-xs text-neutral-500">
          These notes are private and only visible to MaizeLease for quality assurance.
        </p>
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full"
      >
        {loading ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </form>
  )
}
