'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function CoachPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Voice mode states
  const [voiceMode, setVoiceMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognitionAPI) {
        recognitionRef.current = new SpeechRecognitionAPI()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'en-US'

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setVoiceStatus('processing')
          handleVoiceInput(transcript)
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
          setVoiceStatus('idle')
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      window.speechSynthesis?.cancel()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isSpeaking) {
      try {
        window.speechSynthesis?.cancel()
        recognitionRef.current.start()
        setIsListening(true)
        setVoiceStatus('listening')
      } catch (error) {
        console.error('Error starting recognition:', error)
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      setVoiceStatus('idle')
    }
  }

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1
      
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(v => 
        v.name.includes('Samantha') || 
        v.name.includes('Google') || 
        v.name.includes('Natural') ||
        v.lang === 'en-US'
      )
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      utterance.onstart = () => {
        setIsSpeaking(true)
        setVoiceStatus('speaking')
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        setVoiceStatus('idle')
        if (voiceMode) {
          setTimeout(() => {
            startListening()
          }, 500)
        }
      }

      utterance.onerror = () => {
        setIsSpeaking(false)
        setVoiceStatus('idle')
      }

      synthRef.current = utterance
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleVoiceInput = async (transcript: string) => {
    if (!transcript.trim()) {
      setVoiceStatus('idle')
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: transcript
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message
      }

      setMessages(prev => [...prev, assistantMessage])

      if (voiceMode) {
        speakResponse(data.message)
      }
    } catch (error) {
      console.error('Error:', error)
      const errorMessage = "I'm having trouble connecting. Let's try again."
      if (voiceMode) {
        speakResponse(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const startSession = async () => {
    setSessionStarted(true)
    setIsLoading(true)

    const openingMessage = "Hello! I'm here to support you today as your coach. What's on your mind? What would you like to explore in our session?"

    const assistantMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: openingMessage
    }

    setMessages([assistantMessage])
    setIsLoading(false)

    if (voiceMode) {
      speakResponse(openingMessage)
    }
  }

  const startVoiceSession = () => {
    setVoiceMode(true)
    startSession()
  }

  const startTextSession = () => {
    setVoiceMode(false)
    startSession()
  }

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
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const endVoiceMode = () => {
    stopListening()
    window.speechSynthesis?.cancel()
    setVoiceMode(false)
    setVoiceStatus('idle')
    setIsSpeaking(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAFAF8',
      display: 'flex'
    }}>
      {/* Sidebar */}
      <div style={{
        width: '16vw',
        minHeight: '100vh',
        backgroundColor: '#3D5A4C',
        padding: '2.5vw 0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '0 2vw', marginBottom: '4vw' }}>
          <div onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer' }}>
            <h1 style={{
              fontSize: '1.3vw',
              fontWeight: 400,
              color: '#ffffff',
              fontFamily: 'Georgia, serif'
            }}>
              Drama Triangle
            </h1>
            <p style={{
              fontSize: '1vw',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.7)',
              fontFamily: 'Georgia, serif',
              marginTop: '0.2vw'
            }}>
              Coach
            </p>
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
            <div
              key={i}
              onClick={() => router.push(item.href)}
              style={{
                padding: '1vw 1.5vw',
                marginBottom: '0.3vw',
                borderRadius: '0.4vw',
                backgroundColor: item.active ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: item.active ? '#ffffff' : 'rgba(255,255,255,0.6)',
                fontSize: '1vw',
                cursor: 'pointer'
              }}
            >
              {item.name}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Session Selection */}
        {!sessionStarted && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4vw'
          }}>
            <h1 style={{
              fontSize: '2.2vw',
              fontWeight: 500,
              color: '#1a1a1a',
              fontFamily: 'Georgia, serif',
              marginBottom: '1vw',
              textAlign: 'center'
            }}>
              Compassion Coach
            </h1>
            <p style={{
              fontSize: '1.1vw',
              color: '#666',
              marginBottom: '3vw',
              textAlign: 'center',
              maxWidth: '35vw'
            }}>
              ICF-style coaching to help you move from drama to compassion. Choose how you would like to connect.
            </p>

            <div style={{ display: 'flex', gap: '2vw' }}>
              <div
                onClick={startVoiceSession}
                style={{
                  width: '18vw',
                  padding: '2.5vw',
                  backgroundColor: '#F0F7F4',
                  borderRadius: '1vw',
                  cursor: 'pointer',
                  border: '2px solid transparent',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: '4vw',
                  height: '4vw',
                  borderRadius: '50%',
                  backgroundColor: '#3D5A4C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5vw auto'
                }}>
                  <span style={{ fontSize: '1.8vw' }}>🎙️</span>
                </div>
                <h3 style={{
                  fontSize: '1.2vw',
                  fontWeight: 500,
                  color: '#1a1a1a',
                  marginBottom: '0.5vw'
                }}>
                  Voice Conversation
                </h3>
                <p style={{ fontSize: '0.9vw', color: '#666', lineHeight: 1.5 }}>
                  Speak directly with your coach. Like a real coaching call.
                </p>
              </div>

              <div
                onClick={startTextSession}
                style={{
                  width: '18vw',
                  padding: '2.5vw',
                  backgroundColor: '#ffffff',
                  borderRadius: '1vw',
                  cursor: 'pointer',
                  border: '2px solid #e8e8e8',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: '4vw',
                  height: '4vw',
                  borderRadius: '50%',
                  backgroundColor: '#e8e8e8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5vw auto'
                }}>
                  <span style={{ fontSize: '1.8vw' }}>💬</span>
                </div>
                <h3 style={{
                  fontSize: '1.2vw',
                  fontWeight: 500,
                  color: '#1a1a1a',
                  marginBottom: '0.5vw'
                }}>
                  Text Chat
                </h3>
                <p style={{ fontSize: '0.9vw', color: '#666', lineHeight: 1.5 }}>
                  Type your thoughts. Take your time to reflect.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Voice Mode UI */}
        {sessionStarted && voiceMode && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4vw',
            position: 'relative'
          }}>
            <button
              onClick={endVoiceMode}
              style={{
                position: 'absolute',
                top: '2vw',
                right: '2vw',
                padding: '0.5vw 1vw',
                backgroundColor: '#ffffff',
                border: '1px solid #e0e0e0',
                borderRadius: '0.4vw',
                fontSize: '0.9vw',
                color: '#666',
                cursor: 'pointer'
              }}
            >
              Switch to Text
            </button>

            <div style={{
              width: '15vw',
              height: '15vw',
              borderRadius: '50%',
              backgroundColor: voiceStatus === 'listening' ? '#3D5A4C' : 
                             voiceStatus === 'speaking' ? '#4B0082' : 
                             voiceStatus === 'processing' ? '#8B4513' : '#e8e8e8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '3vw',
              transition: 'all 0.3s',
              boxShadow: voiceStatus !== 'idle' ? '0 0 40px rgba(61, 90, 76, 0.3)' : 'none'
            }}>
              <span style={{ fontSize: '4vw' }}>
                {voiceStatus === 'listening' ? '👂' : 
                 voiceStatus === 'speaking' ? '🗣️' : 
                 voiceStatus === 'processing' ? '💭' : '🎙️'}
              </span>
            </div>

            <h2 style={{
              fontSize: '1.5vw',
              fontWeight: 500,
              color: '#1a1a1a',
              marginBottom: '0.5vw',
              fontFamily: 'Georgia, serif'
            }}>
              {voiceStatus === 'listening' ? "I'm listening..." : 
               voiceStatus === 'speaking' ? 'Coach is speaking...' : 
               voiceStatus === 'processing' ? 'Thinking...' : 'Tap to speak'}
            </h2>

            <p style={{ fontSize: '1vw', color: '#666', marginBottom: '2vw' }}>
              {voiceStatus === 'listening' ? 'Share what is on your mind' : 
               voiceStatus === 'speaking' ? 'Listen to your coach response' : 
               voiceStatus === 'processing' ? 'Processing your message' : 'Click the button below'}
            </p>

            {voiceStatus === 'idle' && !isLoading && (
              <button
                onClick={startListening}
                style={{
                  padding: '1vw 2.5vw',
                  backgroundColor: '#3D5A4C',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.5vw',
                  fontSize: '1vw',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Start Speaking
              </button>
            )}

            {voiceStatus === 'listening' && (
              <button
                onClick={stopListening}
                style={{
                  padding: '1vw 2.5vw',
                  backgroundColor: '#A85454',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.5vw',
                  fontSize: '1vw',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Stop Listening
              </button>
            )}

            {voiceStatus === 'speaking' && (
              <button
                onClick={() => {
                  window.speechSynthesis?.cancel()
                  setIsSpeaking(false)
                  setVoiceStatus('idle')
                }}
                style={{
                  padding: '1vw 2.5vw',
                  backgroundColor: '#666',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.5vw',
                  fontSize: '1vw',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Skip Response
              </button>
            )}

            {messages.length > 0 && (
              <div style={{
                position: 'absolute',
                bottom: '2vw',
                left: '2vw',
                right: '2vw',
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: '0.8vw',
                padding: '1.5vw',
                maxHeight: '15vh',
                overflowY: 'auto'
              }}>
                <p style={{ fontSize: '0.8vw', color: '#999', marginBottom: '0.5vw' }}>
                  Last exchange:
                </p>
                {messages.slice(-2).map((msg) => (
                  <p key={msg.id} style={{
                    fontSize: '0.9vw',
                    color: msg.role === 'assistant' ? '#3D5A4C' : '#333',
                    marginBottom: '0.3vw',
                    fontStyle: msg.role === 'assistant' ? 'italic' : 'normal'
                  }}>
                    <strong>{msg.role === 'assistant' ? 'Coach: ' : 'You: '}</strong>
                    {msg.content.length > 150 ? msg.content.substring(0, 150) + '...' : msg.content}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Text Mode UI */}
        {sessionStarted && !voiceMode && (
          <>
            <div style={{
              padding: '1.5vw 2vw',
              borderBottom: '1px solid #e8e8e8',
              backgroundColor: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h1 style={{
                  fontSize: '1.3vw',
                  fontWeight: 500,
                  color: '#1a1a1a',
                  margin: 0
                }}>
                  Compassion Coach
                </h1>
                <p style={{ fontSize: '0.85vw', color: '#666', margin: 0 }}>
                  ICF-style coaching session
                </p>
              </div>
              <button
                onClick={() => setVoiceMode(true)}
                style={{
                  padding: '0.5vw 1vw',
                  backgroundColor: '#F0F7F4',
                  border: '1px solid #3D5A4C',
                  borderRadius: '0.4vw',
                  fontSize: '0.9vw',
                  color: '#3D5A4C',
                  cursor: 'pointer'
                }}
              >
                Switch to Voice
              </button>
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '2vw'
            }}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: '1.5vw'
                  }}
                >
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
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1.5vw' }}>
                  <div style={{
                    padding: '1.2vw 1.5vw',
                    borderRadius: '1vw',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e8e8e8',
                    fontSize: '1vw',
                    color: '#666'
                  }}>
                    Thinking...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div style={{
              padding: '1.5vw 2vw',
              borderTop: '1px solid #e8e8e8',
              backgroundColor: '#ffffff'
            }}>
              <div style={{ display: 'flex', gap: '1vw' }}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Share what is on your mind..."
                  style={{
                    flex: 1,
                    padding: '1vw 1.5vw',
                    fontSize: '1vw',
                    border: '1px solid #e0e0e0',
                    borderRadius: '0.5vw',
                    outline: 'none'
                  }}
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
                    fontSize: '1vw',
                    cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed'
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
