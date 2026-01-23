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
        // Auto-select first conversation if none selected
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-1/4" />
          <div className="h-96 bg-neutral-200 rounded-xl" />
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Messages</h1>
        <p className="mt-2 text-neutral-500">
          Your conversations about listings
        </p>
      </div>
      
      {conversations.length === 0 ? (
        <div className="card p-12 text-center">
          <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No messages yet</h3>
          <p className="text-neutral-500 mb-4">
            When you contact listing owners or receive messages, they&apos;ll appear here.
          </p>
          <Link href="/listings" className="btn btn-primary">
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-240px)]">
          {/* Conversations List */}
          <div className="card overflow-hidden flex flex-col">
            <div className="p-4 border-b border-neutral-100">
              <h2 className="font-semibold text-neutral-900">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conversation) => {
                const lastMessage = conversation.messages[0]
                const isSelected = selectedConversation?.listingId === conversation.listingId && 
                                   selectedConversation?.otherUser.id === conversation.otherUser.id
                
                return (
                  <button
                    key={`${conversation.listingId}-${conversation.otherUser.id}`}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`w-full p-4 text-left border-b border-neutral-100 transition-colors ${
                      isSelected ? 'bg-[#FFCB05]/10' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#00274C] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-semibold">
                          {conversation.otherUser.name?.[0]?.toUpperCase() || 
                           conversation.otherUser.email[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-neutral-900 truncate">
                            {conversation.otherUser.name || conversation.otherUser.email.split('@')[0]}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="w-5 h-5 bg-[#FFCB05] text-[#00274C] rounded-full text-xs font-bold flex items-center justify-center">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-500 truncate mb-1">
                          Re: {conversation.listing.title}
                        </p>
                        {lastMessage && (
                          <p className="text-xs text-neutral-400 truncate">
                            {lastMessage.content.substring(0, 50)}...
                          </p>
                        )}
                      </div>
                    </div>
                    {lastMessage && (
                      <p className="text-xs text-neutral-400 mt-2 text-right">
                        {formatRelativeTime(lastMessage.createdAt)}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
          
          {/* Message Thread */}
          <div className="md:col-span-2 card overflow-hidden flex flex-col">
            {selectedConversation ? (
              <>
                {/* Thread Header */}
                <div className="p-4 border-b border-neutral-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-neutral-900">
                        {selectedConversation.otherUser.name || selectedConversation.otherUser.email.split('@')[0]}
                      </h2>
                      <Link 
                        href={`/listings/${selectedConversation.listingId}`}
                        className="text-sm text-neutral-500 hover:text-[#00274C] transition-colors"
                      >
                        Re: {selectedConversation.listing.title}
                      </Link>
                    </div>
                    <Link 
                      href={`/listings/${selectedConversation.listingId}`}
                      className="btn btn-outline text-sm py-1.5"
                    >
                      View Listing
                    </Link>
                  </div>
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
              <div className="flex-1 flex items-center justify-center text-neutral-500">
                Select a conversation to view messages
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
