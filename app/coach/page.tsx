'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { VoiceChat } from '@/components/coach/VoiceChat'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function CoachPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'voice' | 'text'>('voice')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mode === 'text' && messages.length === 0) {
      setMessages([{
        id: Date.now().toString(),
        role: 'assistant',
        content: "Hello, I'm your Compassion Coach. I'm here to support you today using ICF coaching methods and the Drama Triangle framework. What would you like to focus on in our conversation?"
      }])
    }
  }, [mode, messages.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
        })
      })

      if (!response.ok) throw new Error('Failed to get response')
      const data = await response.json()
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message
      }])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAF8', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '16vw', minHeight: '100vh', backgroundColor: '#3D5A4C', padding: '2.5vw 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 2vw', marginBottom: '4vw' }}>
          <div onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer' }}>
            <h1 style={{ fontSize: '1.3vw', fontWeight: 400, color: '#ffffff', fontFamily: 'Georgia, serif' }}>Drama Triangle</h1>
            <p style={{ fontSize: '1vw', fontWeight: 300, color: 'rgba(255,255,255,0.7)', fontFamily: 'Georgia, serif', marginTop: '0.2vw' }}>Coach</p>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '0 1vw' }}>
          {[
            { name: 'Dashboard', href: '/dashboard' },
            { name: 'Compassion Coach', href: '/coach', active: true },
            { name: 'Mentor Coach', href: '/mentor' },
            { name: 'Learn', href: '/learn' },
            { name: 'Practice', href: '/practice' },
            { name: 'Journal', href: '/journal' },
            { name: 'Progress', href: '/progress' },
            { name: 'Actions', href: '/actions' },
          ].map((item, i) => (
            <div key={i} onClick={() => router.push(item.href)} style={{ padding: '1vw 1.5vw', marginBottom: '0.3vw', borderRadius: '0.4vw', backgroundColor: item.active ? 'rgba(255,255,255,0.12)' : 'transparent', color: item.active ? '#ffffff' : 'rgba(255,255,255,0.6)', fontSize: '1vw', cursor: 'pointer' }}>
              {item.name}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Mode Toggle Header */}
        <div style={{ padding: '1vw 2vw', borderBottom: '1px solid #e8e8e8', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.2vw', fontWeight: 500, color: '#1a1a1a', margin: 0 }}>Compassion Coach</h2>
            <p style={{ fontSize: '0.85vw', color: '#666', margin: 0 }}>ICF-style coaching • Drama Triangle awareness</p>
          </div>
          
          {/* Mode Toggle */}
          <div style={{ display: 'flex', gap: '0.5vw', backgroundColor: '#f0f0f0', padding: '0.3vw', borderRadius: '0.5vw' }}>
            <button
              onClick={() => setMode('voice')}
              style={{
                padding: '0.5vw 1.2vw',
                backgroundColor: mode === 'voice' ? '#3D5A4C' : 'transparent',
                color: mode === 'voice' ? '#fff' : '#666',
                border: 'none',
                borderRadius: '0.4vw',
                cursor: 'pointer',
                fontSize: '0.9vw',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4vw'
              }}
            >
              🎙️ Voice
            </button>
            <button
              onClick={() => setMode('text')}
              style={{
                padding: '0.5vw 1.2vw',
                backgroundColor: mode === 'text' ? '#3D5A4C' : 'transparent',
                color: mode === 'text' ? '#fff' : '#666',
                border: 'none',
                borderRadius: '0.4vw',
                cursor: 'pointer',
                fontSize: '0.9vw',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4vw'
              }}
            >
              💬 Text
            </button>
          </div>
        </div>

        {/* Voice Mode */}
        {mode === 'voice' && (
          <div style={{ flex: 1 }}>
            <VoiceChat />
          </div>
        )}

        {/* Text Mode */}
        {mode === 'text' && (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '2vw' }}>
              {messages.map((message) => (
                <div key={message.id} style={{ display: 'flex', justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '1.5vw' }}>
                  <div style={{
                    maxWidth: '60%',
                    padding: '1.2vw 1.5vw',
                    borderRadius: '1vw',
                    backgroundColor: message.role === 'user' ? '#3D5A4C' : '#ffffff',
                    color: message.role === 'user' ? '#ffffff' : '#333',
                    border: message.role === 'assistant' ? '1px solid #e8e8e8' : 'none',
                    fontSize: '1vw',
                    lineHeight: 1.6
                  }}>
                    {message.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ padding: '1.2vw 1.5vw', borderRadius: '1vw', backgroundColor: '#ffffff', border: '1px solid #e8e8e8', color: '#666' }}>
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '1.5vw 2vw', borderTop: '1px solid #e8e8e8', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', gap: '1vw' }}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Share what's on your mind..."
                  style={{ flex: 1, padding: '1vw 1.5vw', fontSize: '1vw', border: '1px solid #e0e0e0', borderRadius: '0.5vw', outline: 'none' }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  style={{
                    padding: '1vw 2vw',
                    backgroundColor: inputValue.trim() && !isLoading ? '#3D5A4C' : '#ccc',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '0.5vw',
                    cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed',
                    fontSize: '1vw'
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
