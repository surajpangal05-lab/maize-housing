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
          <div className="text-center text-neutral-400 py-8 text-xs">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId
            return (
              <div 
                key={message.id}
                className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                {!isOwn && (
                  <div className="w-8 h-8 border border-neutral-300 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                
                <div className={`max-w-[70%]`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-neutral-600">
                      {message.sender.name || message.sender.email.split('@')[0]}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {formatRelativeTime(message.createdAt)}
                    </span>
                    {isOwn && <span className="text-xs text-neutral-500">You</span>}
                  </div>
                  <div className={`px-4 py-3 text-sm ${
                    isOwn 
                      ? 'bg-neutral-900 text-white' 
                      : 'border border-neutral-200'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
                
                {isOwn && (
                  <div className="w-8 h-8 border border-neutral-900 bg-neutral-900 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
      
      {/* Input */}
      <div className="border-t border-neutral-200 p-4">
        {error && (
          <div className="mb-3 text-xs text-red-600 border border-red-500 px-3 py-2">
            {error}
          </div>
        )}
        <form onSubmit={handleSend} className="flex gap-3">
          <button type="button" className="p-2 border border-neutral-300 hover:border-neutral-900 transition-colors">
            <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 text-sm border border-neutral-300 focus:outline-none focus:border-neutral-900"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-4 py-2 bg-neutral-900 text-white text-xs tracking-wider hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            SEND
          </button>
        </form>
      </div>
    </div>
  )
}
