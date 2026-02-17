'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MessageThread from '@/components/MessageThread'
import { formatRelativeTime } from '@/lib/utils'

interface Conversation {
  listingId: string
  listing: {
    id: string
    title: string
    address: string
  }
  otherUser: {
    id: string
    name: string | null
    email: string
  }
  messages: {
    id: string
    content: string
    senderId: string
    createdAt: string
    sender: {
      name: string | null
      email: string
    }
  }[]
  unreadCount: number
}

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    
    if (status === 'authenticated') {
      fetchMessages()
    }
  }, [status, router])
  
  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages')
      const data = await response.json()
      
      if (data.success) {
        setConversations(data.conversations)
        if (data.conversations.length > 0 && !selectedConversation) {
          setSelectedConversation(data.conversations[0])
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-neutral-200">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="h-4 bg-neutral-100 w-24" />
            <div className="h-4 bg-neutral-100 w-20" />
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse h-[600px] bg-neutral-100" />
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
            ← Back to Home
          </Link>
          <h1 className="text-lg font-serif text-neutral-900">Messages</h1>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {conversations.length === 0 ? (
          <div className="border border-dashed border-neutral-300 p-12 text-center">
            <svg className="w-12 h-12 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="font-serif text-lg text-neutral-900 mb-2">No messages yet</h3>
            <p className="text-neutral-500 text-sm mb-6">
              When you contact listing owners or receive messages, they&apos;ll appear here.
            </p>
            <Link 
              href="/listings" 
              className="inline-block px-6 py-3 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              BROWSE LISTINGS
            </Link>
          </div>
        ) : (
          <div className="border border-neutral-200 grid md:grid-cols-3 h-[600px]">
            {/* Conversations List */}
            <div className="border-r border-neutral-200 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-neutral-200">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-300 focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>
              
              {/* List */}
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conversation) => {
                  const lastMessage = conversation.messages[0]
                  const isSelected = selectedConversation?.listingId === conversation.listingId && 
                                     selectedConversation?.otherUser.id === conversation.otherUser.id
                  
                  return (
                    <button
                      key={`${conversation.listingId}-${conversation.otherUser.id}`}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`w-full p-4 text-left border-b border-neutral-200 transition-colors ${
                        isSelected ? 'bg-neutral-50' : 'hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 border border-neutral-300 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-neutral-900 truncate text-sm">
                              {conversation.otherUser.name || conversation.otherUser.email.split('@')[0]}
                            </p>
                            <div className="flex items-center gap-2">
                              {lastMessage && (
                                <span className="text-xs text-neutral-400">
                                  {formatRelativeTime(lastMessage.createdAt)}
                                </span>
                              )}
                              {conversation.unreadCount > 0 && (
                                <span className="w-2 h-2 bg-neutral-900 rounded-full" />
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-neutral-500 truncate mb-1">
                            {conversation.listing.title}
                          </p>
                          {lastMessage && (
                            <p className="text-xs text-neutral-400 truncate">
                              {lastMessage.content.substring(0, 40)}...
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* Message Thread */}
            <div className="md:col-span-2 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Thread Header */}
                  <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 border border-neutral-300 flex items-center justify-center">
                        <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="font-medium text-neutral-900 text-sm">
                          {selectedConversation.otherUser.name || selectedConversation.otherUser.email.split('@')[0]}
                        </h2>
                        <Link 
                          href={`/listings/${selectedConversation.listingId}`}
                          className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
                        >
                          Re: {selectedConversation.listing.title}
                        </Link>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-neutral-100 transition-colors">
                      <svg className="w-5 h-5 text-neutral-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 overflow-hidden">
                    <MessageThread
                      messages={[...selectedConversation.messages].reverse()}
                      currentUserId={session!.user.id}
                      listingId={selectedConversation.listingId}
                      receiverId={selectedConversation.otherUser.id}
                      onMessageSent={fetchMessages}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-neutral-400 text-sm">
                  Select a conversation to view messages
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
