'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface Message {
  id: number
  role: 'user' | 'mentor'
  content: string
  timestamp: Date
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
]

const VOICES = [
  { id: 'default', name: 'Nova', description: 'Warm & friendly' },
  { id: 'soft', name: 'Shimmer', description: 'Soft & gentle' },
  { id: 'neutral', name: 'Alloy', description: 'Balanced' },
  { id: 'male', name: 'Onyx', description: 'Deep & calm' },
  { id: 'storyteller', name: 'Fable', description: 'Expressive' },
]

const TOPIC_STARTERS = [
  { title: 'Drama Triangle Basics', question: "Can you explain the Drama Triangle and its three roles?" },
  { title: 'Compassion Triangle', question: "What is the Compassion Triangle and how do I use it?" },
  { title: 'Am I a Rescuer?', question: "How do I know if I'm being a Rescuer vs genuinely helping?" },
  { title: 'Breaking the Pattern', question: "How do I stop getting pulled into drama triangles?" },
  { title: 'Victim vs Vulnerable', question: "What's the difference between being a Victim and being Vulnerable?" },
  { title: 'Setting Boundaries', question: "How do I set boundaries without being a Persecutor?" },
  { title: 'Role Switches', question: "Why do people switch between roles in the triangle?" },
  { title: 'The 10-A\'s', question: "Can you teach me Dr. Karpman's Compassion Triangle 10-A's?" },
]

export default function MentorPage() {
  const [userName] = useState('Friend')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoadingAudio, setIsLoadingAudio] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [selectedVoice, setSelectedVoice] = useState('storyteller') // Fable for teaching
  const [autoSpeak, setAutoSpeak] = useState(false)
  const [showLanguages, setShowLanguages] = useState(false)
  const [showVoices, setShowVoices] = useState(false)
  const [showTopics, setShowTopics] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Set initial greeting
  useEffect(() => {
    setMessages([
      {
        id: 1,
        role: 'mentor',
        content: `Hello, ${userName}. I'm your Mentor Coach, here to teach you about Dr. Stephen Karpman's Drama Triangle and Compassion Triangle frameworks.\n\nUnlike a coaching session where I'd ask you questions, I'm here to share knowledge, explain concepts, and give you direct guidance based on Dr. Karpman's life work.\n\nWhat would you like to learn about today?`,
        timestamp: new Date()
      }
    ])
  }, [userName])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio()
    audioRef.current.onended = () => setIsSpeaking(false)
    audioRef.current.onerror = () => {
      setIsSpeaking(false)
      setIsLoadingAudio(false)
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach(track => track.stop())
        await transcribeAudio(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true)
    
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('language', selectedLanguage)

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.text) {
        setInput(prev => prev + data.text)
      }
    } catch (error) {
      console.error('Transcription error:', error)
    } finally {
      setIsTranscribing(false)
    }
  }

  const speakText = async (text: string) => {
    if (isSpeaking || isLoadingAudio) {
      stopSpeaking()
      return
    }

    setIsLoadingAudio(true)

    try {
      const response = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: selectedVoice,
          speed: 0.95 // Slightly slower for teaching
        })
      })

      if (!response.ok) throw new Error('Failed to generate speech')

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.play()
        setIsSpeaking(true)
      }
    } catch (error) {
      console.error('Speech error:', error)
    } finally {
      setIsLoadingAudio(false)
    }
  }

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsSpeaking(false)
    setIsLoadingAudio(false)
  }

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input
    if (!textToSend.trim() || isTyping) return

    setShowTopics(false)

    const userMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content
          })),
          userName,
          language: selectedLanguage
        })
      })

      const data = await response.json()

      if (data.error) throw new Error(data.error)

      const mentorMessage: Message = {
        id: updatedMessages.length + 1,
        role: 'mentor',
        content: data.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, mentorMessage])

      if (autoSpeak) {
        setTimeout(() => speakText(data.message), 300)
      }

    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: updatedMessages.length + 1,
        role: 'mentor',
        content: "I apologize, but I'm having trouble connecting right now. Please try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const selectTopic = (question: string) => {
    sendMessage(question)
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
        backgroundColor: '#4B0082', // Purple for mentor/wisdom
        padding: '2.5vw 0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '0 2vw', marginBottom: '4vw' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <h1 style={{
              fontSize: '1.3vw',
              fontWeight: 400,
              color: '#ffffff',
              fontFamily: 'Georgia, serif',
              letterSpacing: '0.02em'
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
              Mentor
            </p>
          </Link>
        </div>

        <div style={{
          height: '1px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          margin: '0 2vw 2vw 2vw'
        }} />

        <nav style={{ flex: 1, padding: '0 1vw' }}>
          {[
            { name: 'Dashboard', href: '/dashboard', active: false },
            { name: 'Compassion Coach', href: '/coach', active: false },
            { name: 'Mentor Coach', href: '/mentor', active: true },
            { name: 'Learn', href: '/learn', active: false },
            { name: 'Practice', href: '/practice', active: false },
            { name: 'Journal', href: '/journal', active: false },
          ].map((item, i) => (
            <Link 
              key={i} 
              href={item.href}
              style={{
                display: 'block',
                padding: '1vw 1.5vw',
                marginBottom: '0.3vw',
                borderRadius: '0.4vw',
                backgroundColor: item.active ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: item.active ? '#ffffff' : 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                fontSize: '1vw',
                fontWeight: item.active ? 500 : 400,
                letterSpacing: '0.02em',
                transition: 'all 0.2s ease'
              }}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '0 2vw' }}>
          <div style={{
            height: '1px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            marginBottom: '2vw'
          }} />
          
          {/* Mentor Badge */}
          <div style={{
            padding: '1vw',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '0.5vw',
            marginBottom: '1.5vw'
          }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75vw', marginBottom: '0.3vw' }}>
              Mentor Mode
            </p>
            <p style={{ color: '#ffffff', fontSize: '0.85vw', fontWeight: 500 }}>
              📚 Teaching & Advice
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7vw', marginTop: '0.3vw' }}>
              Based on Dr. Karpman's work
            </p>
          </div>

          {/* Coach vs Mentor */}
          <div style={{
            padding: '1vw',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '0.5vw',
            fontSize: '0.75vw',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.5
          }}>
            <p style={{ margin: 0, marginBottom: '0.5vw', color: 'rgba(255,255,255,0.8)' }}>
              💡 Mentor vs Coach
            </p>
            <p style={{ margin: 0 }}>
              <strong>Mentor:</strong> Teaches, advises, explains
            </p>
            <p style={{ margin: 0, marginTop: '0.3vw' }}>
              <strong>Coach:</strong> Asks questions, facilitates
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '1.5vw 2.5vw',
          borderBottom: '1px solid #e8e8e8',
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{
              fontSize: '1.5vw',
              fontWeight: 500,
              color: '#1a1a1a',
              fontFamily: 'Georgia, serif',
              margin: 0
            }}>
              Mentor Coach
            </h1>
            <p style={{ fontSize: '0.9vw', color: '#666666', margin: 0, marginTop: '0.3vw' }}>
              Learn Dr. Karpman's Drama Triangle & Compassion Triangle
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8vw' }}>
            {/* Switch to Coaching */}
            <Link
              href="/coach"
              style={{
                padding: '0.6vw 1vw',
                fontSize: '0.85vw',
                backgroundColor: '#F0F7F4',
                color: '#3D5A4C',
                border: '1px solid #3D5A4C',
                borderRadius: '0.4vw',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3vw'
              }}
            >
              🎯 Switch to Coaching
            </Link>

            {/* Voice Selector */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { setShowVoices(!showVoices); setShowLanguages(false) }}
                style={{
                  padding: '0.6vw 1vw',
                  fontSize: '0.85vw',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #e0e0e0',
                  borderRadius: '0.4vw',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4vw'
                }}
              >
                🔊 {VOICES.find(v => v.id === selectedVoice)?.name}
              </button>
              
              {showVoices && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5vw',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '0.5vw',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 100,
                  minWidth: '12vw'
                }}>
                  {VOICES.map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => {
                        setSelectedVoice(voice.id)
                        setShowVoices(false)
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '0.7vw 1vw',
                        fontSize: '0.85vw',
                        backgroundColor: selectedVoice === voice.id ? '#F5F5FF' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>{voice.name}</span>
                      <span style={{ color: '#666', marginLeft: '0.5vw', fontSize: '0.75vw' }}>
                        {voice.description}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { setShowLanguages(!showLanguages); setShowVoices(false) }}
                style={{
                  padding: '0.6vw 1vw',
                  fontSize: '0.85vw',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #e0e0e0',
                  borderRadius: '0.4vw',
                  cursor: 'pointer'
                }}
              >
                {LANGUAGES.find(l => l.code === selectedLanguage)?.flag}
              </button>
              
              {showLanguages && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5vw',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '0.5vw',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 100,
                  maxHeight: '20vw',
                  overflowY: 'auto'
                }}>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLanguage(lang.code)
                        setShowLanguages(false)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5vw',
                        width: '100%',
                        padding: '0.7vw 1vw',
                        fontSize: '0.85vw',
                        backgroundColor: selectedLanguage === lang.code ? '#F5F5FF' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      {lang.flag} {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auto-speak Toggle */}
            <button
              onClick={() => setAutoSpeak(!autoSpeak)}
              style={{
                padding: '0.6vw 1vw',
                fontSize: '0.85vw',
                backgroundColor: autoSpeak ? '#4B0082' : '#f5f5f5',
                color: autoSpeak ? '#ffffff' : '#666666',
                border: '1px solid',
                borderColor: autoSpeak ? '#4B0082' : '#e0e0e0',
                borderRadius: '0.4vw',
                cursor: 'pointer'
              }}
            >
              🔊 {autoSpeak ? 'On' : 'Off'}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '2vw 2.5vw'
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
                maxWidth: '65%',
                display: 'flex',
                gap: '1vw',
                flexDirection: message.role === 'user' ? 'row-reverse' : 'row'
              }}>
                <div style={{
                  width: '2.5vw',
                  height: '2.5vw',
                  borderRadius: '50%',
                  backgroundColor: message.role === 'mentor' ? '#4B0082' : '#e8e8e8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{
                    fontSize: '1vw',
                    color: message.role === 'mentor' ? '#ffffff' : '#666666',
                    fontFamily: 'Georgia, serif'
                  }}>
                    {message.role === 'mentor' ? 'M' : userName.charAt(0)}
                  </span>
                </div>

                <div>
                  <div style={{
                    padding: '1.2vw 1.5vw',
                    borderRadius: '1vw',
                    backgroundColor: message.role === 'mentor' ? '#ffffff' : '#4B0082',
                    color: message.role === 'mentor' ? '#1a1a1a' : '#ffffff',
                    border: message.role === 'mentor' ? '1px solid #e8e8e8' : 'none',
                    fontSize: '1vw',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {message.content}
                  </div>
                  
                  {message.role === 'mentor' && (
                    <button
                      onClick={() => speakText(message.content)}
                      disabled={isLoadingAudio}
                      style={{
                        marginTop: '0.5vw',
                        padding: '0.3vw 0.8vw',
                        fontSize: '0.75vw',
                        color: isSpeaking ? '#4B0082' : '#666',
                        backgroundColor: isSpeaking ? '#F5F5FF' : 'transparent',
                        border: '1px solid',
                        borderColor: isSpeaking ? '#4B0082' : '#e0e0e0',
                        borderRadius: '0.3vw',
                        cursor: 'pointer'
                      }}
                    >
                      {isLoadingAudio ? '⏳' : isSpeaking ? '⏹ Stop' : '🔊 Listen'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Topic Suggestions - shown initially */}
          {showTopics && messages.length === 1 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1vw',
              marginTop: '1vw'
            }}>
              {TOPIC_STARTERS.map((topic, i) => (
                <button
                  key={i}
                  onClick={() => selectTopic(topic.question)}
                  style={{
                    padding: '1.2vw',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '0.8vw',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  <p style={{
                    fontSize: '0.95vw',
                    fontWeight: 500,
                    color: '#4B0082',
                    margin: 0,
                    marginBottom: '0.3vw'
                  }}>
                    {topic.title}
                  </p>
                  <p style={{
                    fontSize: '0.8vw',
                    color: '#666',
                    margin: 0
                  }}>
                    {topic.question}
                  </p>
                </button>
              ))}
            </div>
          )}

          {isTyping && (
            <div style={{
              display: 'flex',
              gap: '1vw',
              marginBottom: '1.5vw'
            }}>
              <div style={{
                width: '2.5vw',
                height: '2.5vw',
                borderRadius: '50%',
                backgroundColor: '#4B0082',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '1vw', color: '#ffffff', fontFamily: 'Georgia, serif' }}>M</span>
              </div>
              <div style={{
                padding: '1.2vw 1.5vw',
                borderRadius: '1vw',
                backgroundColor: '#ffffff',
                border: '1px solid #e8e8e8'
              }}>
                <div style={{ display: 'flex', gap: '0.3vw' }}>
                  <div style={{ width: '0.5vw', height: '0.5vw', borderRadius: '50%', backgroundColor: '#999', animation: 'pulse 1.5s infinite' }} />
                  <div style={{ width: '0.5vw', height: '0.5vw', borderRadius: '50%', backgroundColor: '#999', animation: 'pulse 1.5s infinite 0.3s' }} />
                  <div style={{ width: '0.5vw', height: '0.5vw', borderRadius: '50%', backgroundColor: '#999', animation: 'pulse 1.5s infinite 0.6s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{
          padding: '1.5vw 2.5vw',
          borderTop: '1px solid #e8e8e8',
          backgroundColor: '#ffffff'
        }}>
          <div style={{
            display: 'flex',
            gap: '1vw',
            alignItems: 'flex-end'
          }}>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing}
              style={{
                padding: '1vw',
                fontSize: '1.2vw',
                backgroundColor: isRecording ? '#ef4444' : '#f5f5f5',
                color: isRecording ? '#ffffff' : '#666666',
                border: 'none',
                borderRadius: '0.8vw',
                cursor: 'pointer'
              }}
            >
              {isTranscribing ? '⏳' : isRecording ? '⏹' : '🎤'}
            </button>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about the Drama Triangle..."
              rows={2}
              style={{
                flex: 1,
                padding: '1vw 1.2vw',
                fontSize: '1vw',
                border: '1px solid #e0e0e0',
                borderRadius: '0.8vw',
                backgroundColor: '#FAFAF8',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
                lineHeight: 1.5
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              style={{
                padding: '1vw 2vw',
                fontSize: '1vw',
                fontWeight: 500,
                color: '#ffffff',
                backgroundColor: input.trim() && !isTyping ? '#4B0082' : '#ccc',
                border: 'none',
                borderRadius: '0.8vw',
                cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed'
              }}
            >
              Ask
            </button>
          </div>
          <p style={{
            fontSize: '0.75vw',
            color: '#999',
            marginTop: '0.8vw',
            textAlign: 'center'
          }}>
            📚 Ask questions, get explanations, and receive direct advice
          </p>
        </div>
      </div>

      {/* Right Panel - Quick Reference */}
      <div style={{
        width: '18vw',
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid #e8e8e8',
        padding: '2vw',
        overflowY: 'auto'
      }}>
        <h2 style={{
          fontSize: '1.1vw',
          fontWeight: 500,
          color: '#1a1a1a',
          fontFamily: 'Georgia, serif',
          marginBottom: '1.5vw'
        }}>
          Dr. Karpman's Concepts
        </h2>

        {/* Drama Triangle */}
        <div style={{
          padding: '1.2vw',
          backgroundColor: '#FFF8F0',
          borderRadius: '0.8vw',
          marginBottom: '1vw'
        }}>
          <h3 style={{ fontSize: '0.95vw', fontWeight: 500, color: '#8B4513', marginBottom: '0.8vw' }}>
            🔺 Drama Triangle
          </h3>
          <div style={{ fontSize: '0.8vw', color: '#666', lineHeight: 1.6 }}>
            <p style={{ margin: '0 0 0.3vw 0' }}><strong>Victim:</strong> "Poor me"</p>
            <p style={{ margin: '0 0 0.3vw 0' }}><strong>Persecutor:</strong> "It's your fault"</p>
            <p style={{ margin: 0 }}><strong>Rescuer:</strong> "Let me fix it"</p>
          </div>
        </div>

        {/* Compassion Triangle */}
        <div style={{
          padding: '1.2vw',
          backgroundColor: '#F0F7F4',
          borderRadius: '0.8vw',
          marginBottom: '1vw'
        }}>
          <h3 style={{ fontSize: '0.95vw', fontWeight: 500, color: '#3D5A4C', marginBottom: '0.8vw' }}>
            💚 Compassion Triangle
          </h3>
          <div style={{ fontSize: '0.8vw', color: '#666', lineHeight: 1.6 }}>
            <p style={{ margin: '0 0 0.3vw 0' }}><strong>Vulnerable:</strong> Owns feelings</p>
            <p style={{ margin: '0 0 0.3vw 0' }}><strong>Assertive:</strong> Sets boundaries</p>
            <p style={{ margin: 0 }}><strong>Caring:</strong> Empowers others</p>
          </div>
        </div>

        {/* Key Concepts */}
        <div style={{
          padding: '1.2vw',
          backgroundColor: '#F5F5FF',
          borderRadius: '0.8vw',
          marginBottom: '1.5vw'
        }}>
          <h3 style={{ fontSize: '0.95vw', fontWeight: 500, color: '#4B0082', marginBottom: '0.8vw' }}>
            📖 Key Concepts
          </h3>
          <div style={{ fontSize: '0.8vw', color: '#666', lineHeight: 1.6 }}>
            <p style={{ margin: '0 0 0.3vw 0' }}>• Role Switches</p>
            <p style={{ margin: '0 0 0.3vw 0' }}>• The 10% Rule</p>
            <p style={{ margin: '0 0 0.3vw 0' }}>• The 10-A's</p>
            <p style={{ margin: '0 0 0.3vw 0' }}>• Scales of Intimacy</p>
            <p style={{ margin: 0 }}>• The Trust Contract</p>
          </div>
        </div>

        {/* Quick Questions */}
        <h3 style={{
          fontSize: '0.95vw',
          fontWeight: 500,
          color: '#1a1a1a',
          marginBottom: '1vw'
        }}>
          Quick Questions
        </h3>
        
        {[
          "What role do I default to?",
          "How do I exit the triangle?",
          "Explain the 10-A's",
        ].map((question, i) => (
          <button
            key={i}
            onClick={() => setInput(question)}
            style={{
              display: 'block',
              width: '100%',
              padding: '0.8vw 1vw',
              marginBottom: '0.5vw',
              fontSize: '0.85vw',
              color: '#4B0082',
              backgroundColor: 'transparent',
              border: '1px solid #e0e0e0',
              borderRadius: '0.5vw',
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            {question}
          </button>
        ))}

        {/* About Karpman */}
        <div style={{
          marginTop: '1.5vw',
          padding: '1vw',
          backgroundColor: '#f9f9f9',
          borderRadius: '0.5vw',
          fontSize: '0.75vw',
          color: '#666',
          lineHeight: 1.5
        }}>
          <p style={{ margin: 0, fontWeight: 500, color: '#4B0082' }}>
            About Dr. Stephen Karpman
          </p>
          <p style={{ margin: '0.5vw 0 0 0' }}>
            Creator of the Drama Triangle (1968). Winner of the Eric Berne Memorial Scientific Award.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}