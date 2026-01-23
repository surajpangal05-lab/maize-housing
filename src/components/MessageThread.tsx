'use client'

import { useState } from 'react'
import { formatRelativeTime } from '@/lib/utils'

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
  sender: {
    name: string | null
    email: string
  }
}

interface MessageThreadProps {
  messages: Message[]
  currentUserId: string
  listingId: string
  receiverId: string
  onMessageSent?: () => void
}

export default function MessageThread({ 
  messages, 
  currentUserId, 
  listingId, 
  receiverId,
  onMessageSent 
}: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim()) return
    
    setSending(true)
    setError('')
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          receiverId,
          content: newMessage.trim()
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setNewMessage('')
        onMessageSent?.()
      } else {
        setError(data.error || 'Failed to send message')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setSending(false)
    }
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-neutral-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId
            return (
              <div 
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] ${isOwn ? 'order-1' : ''}`}>
                  <div className={`px-4 py-2.5 rounded-2xl ${
                    isOwn 
                      ? 'bg-[#00274C] text-white rounded-br-md' 
                      : 'bg-neutral-100 text-neutral-900 rounded-bl-md'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className={`text-xs text-neutral-400 mt-1 ${isOwn ? 'text-right' : ''}`}>
                    {message.sender.name || message.sender.email.split('@')[0]} • {formatRelativeTime(message.createdAt)}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
      
      {/* Input */}
      <div className="border-t border-neutral-200 p-4">
        {error && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 input"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="btn btn-primary px-6"
          >
            {sending ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

