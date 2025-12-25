'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface Message {
  id: number
  role: 'user' | 'coach'
  content: string
  timestamp: Date
  isSummary?: boolean
}

interface Action {
  id: number
  action: string
  timeline: string
  accountability: string
  completed: boolean
  createdAt: Date
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

// End session trigger phrases
const END_SESSION_TRIGGERS = [
  'end session',
  'end the session',
  'finish session',
  'finish the session',
  'close session',
  'close the session',
  'that\'s all',
  'that is all',
  'i\'m done',
  'im done',
  'we\'re done',
  'were done',
  'goodbye',
  'bye',
  'thank you, that\'s all',
  'thanks, that\'s all',
  'end coaching',
  'stop session',
  'wrap up',
  'let\'s wrap up',
  'i want to end',
  'i\'d like to end',
]

export default function CoachPage() {
  const [userName] = useState('Friend')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoadingAudio, setIsLoadingAudio] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [selectedVoice, setSelectedVoice] = useState('default')
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [showLanguages, setShowLanguages] = useState(false)
  const [showVoices, setShowVoices] = useState(false)
  const [actions, setActions] = useState<Action[]>([])
  const [showActions, setShowActions] = useState(true)
  const [voiceMode, setVoiceMode] = useState(false)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [pendingActions, setPendingActions] = useState<Array<{action: string, timeline: string}>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Set initial greeting
  useEffect(() => {
    setMessages([
      {
        id: 1,
        role: 'coach',
        content: `Hello, ${userName}. What's on your mind today?`,
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

  // Check if message is an end session request
  const isEndSessionRequest = (text: string): boolean => {
    const lowerText = text.toLowerCase().trim()
    return END_SESSION_TRIGGERS.some(trigger => 
      lowerText.includes(trigger) || lowerText === trigger
    )
  }

  // Extract actions from summary text
  const extractActionsFromSummary = (text: string): Array<{action: string, timeline: string}> => {
    const extractedActions: Array<{action: string, timeline: string}> = []
    
    // Look for action patterns in the summary
    const actionPatterns = [
      /🎯\s*\*?\*?Action:?\*?\*?\s*(.+?)(?=\n|$)/gi,
      /\[ACTION:\s*([^\|]+)\|\s*TIMELINE:\s*([^\]]+)\]/gi,
      /Action:\s*(.+?)(?=\n|$)/gi,
      /Committed Action:\s*(.+?)(?=\n|$)/gi,
    ]

    for (const pattern of actionPatterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        const actionText = match[1]?.trim()
        const timeline = match[2]?.trim() || 'This week'
        if (actionText && !extractedActions.some(a => a.action === actionText)) {
          extractedActions.push({ action: actionText, timeline })
        }
      }
    }

    // Also look for bullet points under "Action" sections
    const lines = text.split('\n')
    let inActionSection = false
    for (const line of lines) {
      if (line.toLowerCase().includes('action') && (line.includes('🎯') || line.includes('**'))) {
        inActionSection = true
        continue
      }
      if (inActionSection && line.trim().startsWith('-')) {
        const actionText = line.trim().substring(1).trim()
        if (actionText && !extractedActions.some(a => a.action === actionText)) {
          extractedActions.push({ action: actionText, timeline: 'This week' })
        }
      }
      if (inActionSection && line.trim() === '') {
        inActionSection = false
      }
    }

    return extractedActions
  }

  // Add pending actions to the actions list
  const addPendingActionsToList = () => {
    if (pendingActions.length > 0) {
      const newActions = pendingActions.map((a, i) => ({
        id: Date.now() + i,
        action: a.action,
        timeline: a.timeline,
        accountability: 'Self-tracked',
        completed: false,
        createdAt: new Date()
      }))
      setActions(prev => [...prev, ...newActions])
      setPendingActions([])
      setShowActions(true)
    }
  }

  // Start recording voice
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

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.text) {
        if (voiceMode) {
          await sendMessage(data.text)
        } else {
          setInput(prev => prev + data.text)
        }
      }
    } catch (error) {
      console.error('Transcription error:', error)
      alert('Could not transcribe audio. Please try again.')
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
          speed: 1.0
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate speech')
      }

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
    if (!textToSend.trim() || isTyping || sessionEnded) return

    // Check if this is an end session request
    if (isEndSessionRequest(textToSend)) {
      setShowEndConfirm(true)
      return
    }

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
      const response = await fetch('/api/chat', {
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

      if (data.error) {
        throw new Error(data.error)
      }

      const coachMessage: Message = {
        id: updatedMessages.length + 1,
        role: 'coach',
        content: data.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, coachMessage])

      if (data.actions && data.actions.length > 0) {
        const newActions = data.actions.map((a: {action: string, timeline: string, accountability: string}, i: number) => ({
          id: Date.now() + i,
          action: a.action,
          timeline: a.timeline,
          accountability: a.accountability,
          completed: false,
          createdAt: new Date()
        }))
        setActions(prev => [...prev, ...newActions])
      }

      if (autoSpeak || voiceMode) {
        setTimeout(() => speakText(data.message), 300)
      }

    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: updatedMessages.length + 1,
        role: 'coach',
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

  const endSession = async () => {
    setShowEndConfirm(false)
    setIsTyping(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          userName,
          language: selectedLanguage,
          requestSummary: true
        })
      })

      const data = await response.json()

      const summaryMessage: Message = {
        id: messages.length + 1,
        role: 'coach',
        content: data.message,
        timestamp: new Date(),
        isSummary: true
      }

      setMessages(prev => [...prev, summaryMessage])

      // Extract actions from summary
      const extractedActions = extractActionsFromSummary(data.message)
      if (extractedActions.length > 0) {
        setPendingActions(extractedActions)
      }

      // Also add any explicitly formatted actions
      if (data.actions && data.actions.length > 0) {
        const newActions = data.actions.map((a: {action: string, timeline: string, accountability: string}, i: number) => ({
          id: Date.now() + i,
          action: a.action,
          timeline: a.timeline,
          accountability: a.accountability,
          completed: false,
          createdAt: new Date()
        }))
        setActions(prev => [...prev, ...newActions])
      }

      if (autoSpeak || voiceMode) {
        setTimeout(() => speakText(data.message), 300)
      }

      setSessionEnded(true)

    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const requestSessionSummary = async () => {
    setIsTyping(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          userName,
          language: selectedLanguage,
          requestSummary: true
        })
      })

      const data = await response.json()

      const summaryMessage: Message = {
        id: messages.length + 1,
        role: 'coach',
        content: data.message,
        timestamp: new Date(),
        isSummary: true
      }

      setMessages(prev => [...prev, summaryMessage])

      // Extract actions from summary
      const extractedActions = extractActionsFromSummary(data.message)
      if (extractedActions.length > 0) {
        setPendingActions(extractedActions)
      }

      if (data.actions && data.actions.length > 0) {
        const newActions = data.actions.map((a: {action: string, timeline: string, accountability: string}, i: number) => ({
          id: Date.now() + i,
          action: a.action,
          timeline: a.timeline,
          accountability: a.accountability,
          completed: false,
          createdAt: new Date()
        }))
        setActions(prev => [...prev, ...newActions])
      }

      if (autoSpeak || voiceMode) {
        setTimeout(() => speakText(data.message), 300)
      }

    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const startNewSession = () => {
    setMessages([
      {
        id: 1,
        role: 'coach',
        content: `Welcome back, ${userName}. What would you like to explore today?`,
        timestamp: new Date()
      }
    ])
    setSessionEnded(false)
    setPendingActions([])
  }

  const toggleActionComplete = (id: number) => {
    setActions(prev => prev.map(a => 
      a.id === id ? { ...a, completed: !a.completed } : a
    ))
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAFAF8',
      display: 'flex'
    }}>
      
      {/* End Session Confirmation Modal */}
      {showEndConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '1vw',
            padding: '2vw',
            maxWidth: '25vw',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{
              fontSize: '1.2vw',
              fontWeight: 500,
              color: '#1a1a1a',
              fontFamily: 'Georgia, serif',
              marginBottom: '1vw'
            }}>
              End Session?
            </h3>
            <p style={{
              fontSize: '0.95vw',
              color: '#666',
              marginBottom: '1.5vw',
              lineHeight: 1.5
            }}>
              I'll provide a summary of our conversation with key insights and any committed actions.
            </p>
            <div style={{ display: 'flex', gap: '1vw', justifyContent: 'center' }}>
              <button
                onClick={() => setShowEndConfirm(false)}
                style={{
                  padding: '0.7vw 1.5vw',
                  fontSize: '0.9vw',
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  border: '1px solid #e0e0e0',
                  borderRadius: '0.5vw',
                  cursor: 'pointer'
                }}
              >
                Continue Session
              </button>
              <button
                onClick={endSession}
                style={{
                  padding: '0.7vw 1.5vw',
                  fontSize: '0.9vw',
                  backgroundColor: '#3D5A4C',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.5vw',
                  cursor: 'pointer'
                }}
              >
                End & Summarize
              </button>
            </div>
          </div>
        </div>
      )}

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
              Coach
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
            { name: 'Compassion Coach', href: '/coach', active: true },
            { name: 'Learn', href: '/learn', active: false },
            { name: 'Practice', href: '/practice', active: false },
            { name: 'Journal', href: '/journal', active: false },
            { name: 'Progress', href: '/progress', active: false },
          ].map((item, i) => (
            <Link 
              key={i} 
              href={item.href}
              style={{
                display: 'block',
                padding: '1vw 1.5vw',
                marginBottom: '0.3vw',
                borderRadius: '0.4vw',
                backgroundColor: item.active ? 'rgba(255,255,255,0.12)' : 'transparent',
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
          
          <div style={{
            padding: '1vw',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '0.5vw',
            marginBottom: '1.5vw'
          }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75vw', marginBottom: '0.3vw' }}>
              Coaching Standard
            </p>
            <p style={{ color: '#ffffff', fontSize: '0.85vw', fontWeight: 500 }}>
              ICF ACC/PCC Level
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7vw', marginTop: '0.3vw' }}>
              2025 Core Competencies
            </p>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8vw', marginBottom: '0.5vw' }}>
            Session Status
          </p>
          <p style={{ color: sessionEnded ? '#fbbf24' : '#4ade80', fontSize: '0.9vw' }}>
            {sessionEnded ? '✓ Completed' : '● Active'}
          </p>
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
              Compassion Coach
            </h1>
            <p style={{ fontSize: '0.9vw', color: '#666666', margin: 0, marginTop: '0.3vw' }}>
              {voiceMode ? '🎙️ Voice conversation mode' : 'ICF-aligned coaching'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8vw' }}>
            {/* Voice Mode Toggle */}
            <button
              onClick={() => setVoiceMode(!voiceMode)}
              disabled={sessionEnded}
              style={{
                padding: '0.6vw 1vw',
                fontSize: '0.85vw',
                backgroundColor: voiceMode ? '#3D5A4C' : '#f5f5f5',
                color: voiceMode ? '#ffffff' : '#666666',
                border: '1px solid',
                borderColor: voiceMode ? '#3D5A4C' : '#e0e0e0',
                borderRadius: '0.4vw',
                cursor: sessionEnded ? 'not-allowed' : 'pointer',
                fontWeight: voiceMode ? 500 : 400,
                opacity: sessionEnded ? 0.5 : 1
              }}
            >
              🎙️ Voice
            </button>

            {/* End Session Button */}
            <button
              onClick={() => setShowEndConfirm(true)}
              disabled={isTyping || messages.length < 3 || sessionEnded}
              style={{
                padding: '0.6vw 1vw',
                fontSize: '0.85vw',
                backgroundColor: sessionEnded ? '#f5f5f5' : '#FFF8F0',
                color: sessionEnded ? '#999' : '#8B4513',
                border: '1px solid',
                borderColor: sessionEnded ? '#e0e0e0' : '#8B4513',
                borderRadius: '0.4vw',
                cursor: sessionEnded || messages.length < 3 ? 'not-allowed' : 'pointer',
                opacity: sessionEnded ? 0.5 : 1
              }}
            >
              ✓ End Session
            </button>

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
                        backgroundColor: selectedVoice === voice.id ? '#F0F7F4' : 'transparent',
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
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4vw'
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
                        backgroundColor: selectedLanguage === lang.code ? '#F0F7F4' : 'transparent',
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
                maxWidth: '60%',
                display: 'flex',
                gap: '1vw',
                flexDirection: message.role === 'user' ? 'row-reverse' : 'row'
              }}>
                <div style={{
                  width: '2.5vw',
                  height: '2.5vw',
                  borderRadius: '50%',
                  backgroundColor: message.role === 'coach' ? '#3D5A4C' : '#e8e8e8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{
                    fontSize: '1vw',
                    color: message.role === 'coach' ? '#ffffff' : '#666666',
                    fontFamily: 'Georgia, serif'
                  }}>
                    {message.role === 'coach' ? 'C' : userName.charAt(0)}
                  </span>
                </div>

                <div>
                  <div style={{
                    padding: '1.2vw 1.5vw',
                    borderRadius: '1vw',
                    backgroundColor: message.role === 'coach' 
                      ? message.isSummary ? '#F0F7F4' : '#ffffff' 
                      : '#3D5A4C',
                    color: message.role === 'coach' ? '#1a1a1a' : '#ffffff',
                    border: message.role === 'coach' 
                      ? message.isSummary ? '2px solid #3D5A4C' : '1px solid #e8e8e8'
                      : 'none',
                    fontSize: '1vw',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {message.isSummary && (
                      <div style={{
                        fontSize: '0.8vw',
                        color: '#3D5A4C',
                        fontWeight: 600,
                        marginBottom: '0.5vw',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        📋 Session Summary
                      </div>
                    )}
                    {message.content}
                  </div>
                  
                  {/* Buttons for coach messages */}
                  <div style={{ display: 'flex', gap: '0.5vw', marginTop: '0.5vw' }}>
                    {message.role === 'coach' && (
                      <button
                        onClick={() => speakText(message.content)}
                        disabled={isLoadingAudio}
                        style={{
                          padding: '0.3vw 0.8vw',
                          fontSize: '0.75vw',
                          color: isSpeaking ? '#3D5A4C' : '#666',
                          backgroundColor: isSpeaking ? '#F0F7F4' : 'transparent',
                          border: '1px solid',
                          borderColor: isSpeaking ? '#3D5A4C' : '#e0e0e0',
                          borderRadius: '0.3vw',
                          cursor: 'pointer'
                        }}
                      >
                        {isLoadingAudio ? '⏳' : isSpeaking ? '⏹ Stop' : '🔊 Listen'}
                      </button>
                    )}
                    
                    {/* Copy Actions button for summary messages */}
                    {message.isSummary && pendingActions.length > 0 && (
                      <button
                        onClick={addPendingActionsToList}
                        style={{
                          padding: '0.3vw 0.8vw',
                          fontSize: '0.75vw',
                          color: '#3D5A4C',
                          backgroundColor: '#F0F7F4',
                          border: '1px solid #3D5A4C',
                          borderRadius: '0.3vw',
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                      >
                        ✓ Add {pendingActions.length} Action{pendingActions.length > 1 ? 's' : ''} to List
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

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
                backgroundColor: '#3D5A4C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '1vw', color: '#ffffff', fontFamily: 'Georgia, serif' }}>C</span>
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
          {sessionEnded ? (
            // Session Ended State
            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontSize: '1vw',
                color: '#666',
                marginBottom: '1vw'
              }}>
                Session complete. Your actions have been saved.
              </p>
              <button
                onClick={startNewSession}
                style={{
                  padding: '0.8vw 2vw',
                  fontSize: '1vw',
                  backgroundColor: '#3D5A4C',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.5vw',
                  cursor: 'pointer'
                }}
              >
                Start New Session
              </button>
            </div>
          ) : voiceMode ? (
            // Voice Mode Input
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing || isTyping}
                style={{
                  width: '5vw',
                  height: '5vw',
                  borderRadius: '50%',
                  backgroundColor: isRecording ? '#ef4444' : '#3D5A4C',
                  color: '#ffffff',
                  border: 'none',
                  cursor: isTranscribing || isTyping ? 'not-allowed' : 'pointer',
                  fontSize: '2vw',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  transition: 'all 0.2s',
                  boxShadow: isRecording ? '0 0 0 0.5vw rgba(239,68,68,0.3)' : 'none'
                }}
              >
                {isTranscribing ? '⏳' : isRecording ? '⏹' : '🎤'}
              </button>
              <p style={{
                fontSize: '0.9vw',
                color: isRecording ? '#ef4444' : '#666',
                marginTop: '1vw'
              }}>
                {isTranscribing ? 'Transcribing...' : isRecording ? 'Listening... tap to stop' : 'Tap to speak'}
              </p>
              <p style={{
                fontSize: '0.75vw',
                color: '#999',
                marginTop: '0.5vw'
              }}>
                Say "end session" or "that's all" when you're done
              </p>
            </div>
          ) : (
            // Text Mode Input
            <>
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
                  placeholder={isRecording ? 'Listening...' : 'Share what\'s on your mind...'}
                  rows={2}
                  style={{
                    flex: 1,
                    padding: '1vw 1.2vw',
                    fontSize: '1vw',
                    border: '1px solid',
                    borderColor: isRecording ? '#3D5A4C' : '#e0e0e0',
                    borderRadius: '0.8vw',
                    backgroundColor: isRecording ? '#F0F7F4' : '#FAFAF8',
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
                    backgroundColor: input.trim() && !isTyping ? '#3D5A4C' : '#ccc',
                    border: 'none',
                    borderRadius: '0.8vw',
                    cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed'
                  }}
                >
                  Send
                </button>
              </div>
              <p style={{
                fontSize: '0.75vw',
                color: '#999',
                marginTop: '0.8vw',
                textAlign: 'center'
              }}>
                Type "end session" when you're ready to wrap up
              </p>
            </>
          )}
        </div>
      </div>

      {/* Right Panel - Actions & Reference */}
      <div style={{
        width: '18vw',
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid #e8e8e8',
        padding: '2vw',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'flex',
          gap: '0.5vw',
          marginBottom: '1.5vw'
        }}>
          <button
            onClick={() => setShowActions(true)}
            style={{
              flex: 1,
              padding: '0.6vw',
              fontSize: '0.85vw',
              backgroundColor: showActions ? '#3D5A4C' : '#f5f5f5',
              color: showActions ? '#ffffff' : '#666',
              border: 'none',
              borderRadius: '0.4vw',
              cursor: 'pointer'
            }}
          >
            Actions ({actions.length})
          </button>
          <button
            onClick={() => setShowActions(false)}
            style={{
              flex: 1,
              padding: '0.6vw',
              fontSize: '0.85vw',
              backgroundColor: !showActions ? '#3D5A4C' : '#f5f5f5',
              color: !showActions ? '#ffffff' : '#666',
              border: 'none',
              borderRadius: '0.4vw',
              cursor: 'pointer'
            }}
          >
            Reference
          </button>
        </div>

        {showActions ? (
          <>
            <h2 style={{
              fontSize: '1.1vw',
              fontWeight: 500,
              color: '#1a1a1a',
              fontFamily: 'Georgia, serif',
              marginBottom: '1vw'
            }}>
              Committed Actions
            </h2>

            {/* Pending Actions Banner */}
            {pendingActions.length > 0 && (
              <div style={{
                padding: '1vw',
                backgroundColor: '#FFF8F0',
                border: '1px solid #fbbf24',
                borderRadius: '0.5vw',
                marginBottom: '1vw'
              }}>
                <p style={{ fontSize: '0.85vw', color: '#8B4513', margin: 0, marginBottom: '0.5vw' }}>
                  {pendingActions.length} new action{pendingActions.length > 1 ? 's' : ''} from summary
                </p>
                <button
                  onClick={addPendingActionsToList}
                  style={{
                    padding: '0.4vw 0.8vw',
                    fontSize: '0.8vw',
                    backgroundColor: '#3D5A4C',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '0.3vw',
                    cursor: 'pointer'
                  }}
                >
                  ✓ Add to List
                </button>
              </div>
            )}

            {actions.length === 0 ? (
              <div style={{
                padding: '2vw',
                backgroundColor: '#f9f9f9',
                borderRadius: '0.5vw',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '0.9vw', color: '#666', margin: 0 }}>
                  Actions will appear here after your session summary.
                </p>
              </div>
            ) : (
              <div>
                {actions.map((action) => (
                  <div
                    key={action.id}
                    style={{
                      padding: '1vw',
                      backgroundColor: action.completed ? '#F0F7F4' : '#ffffff',
                      border: '1px solid #e8e8e8',
                      borderRadius: '0.5vw',
                      marginBottom: '0.8vw'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.8vw'
                    }}>
                      <button
                        onClick={() => toggleActionComplete(action.id)}
                        style={{
                          width: '1.2vw',
                          height: '1.2vw',
                          borderRadius: '50%',
                          border: '2px solid',
                          borderColor: action.completed ? '#3D5A4C' : '#ccc',
                          backgroundColor: action.completed ? '#3D5A4C' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '0.2vw'
                        }}
                      >
                        {action.completed && (
                          <span style={{ color: '#fff', fontSize: '0.7vw' }}>✓</span>
                        )}
                      </button>
                      <div style={{ flex: 1 }}>
                        <p style={{
                          fontSize: '0.9vw',
                          color: action.completed ? '#666' : '#1a1a1a',
                          textDecoration: action.completed ? 'line-through' : 'none',
                          margin: 0,
                          marginBottom: '0.3vw'
                        }}>
                          {action.action}
                        </p>
                        <p style={{ fontSize: '0.75vw', color: '#3D5A4C', margin: 0 }}>
                          📅 {action.timeline}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <h2 style={{
              fontSize: '1.1vw',
              fontWeight: 500,
              color: '#1a1a1a',
              fontFamily: 'Georgia, serif',
              marginBottom: '1.5vw'
            }}>
              Quick Reference
            </h2>

            <div style={{
              padding: '1.2vw',
              backgroundColor: '#FFF8F0',
              borderRadius: '0.8vw',
              marginBottom: '1vw'
            }}>
              <h3 style={{ fontSize: '0.95vw', fontWeight: 500, color: '#8B4513', marginBottom: '0.5vw' }}>
                Drama Triangle
              </h3>
              <p style={{ fontSize: '0.85vw', color: '#666', lineHeight: 1.5, margin: 0 }}>
                Victim • Persecutor • Rescuer
              </p>
            </div>

            <div style={{
              padding: '1.2vw',
              backgroundColor: '#F0F7F4',
              borderRadius: '0.8vw',
              marginBottom: '1vw'
            }}>
              <h3 style={{ fontSize: '0.95vw', fontWeight: 500, color: '#3D5A4C', marginBottom: '0.5vw' }}>
                Compassion Triangle
              </h3>
              <p style={{ fontSize: '0.85vw', color: '#666', lineHeight: 1.5, margin: 0 }}>
                Vulnerable • Assertive • Caring
              </p>
            </div>

            <div style={{
              padding: '1.2vw',
              backgroundColor: '#F5F5FF',
              borderRadius: '0.8vw',
              marginBottom: '1.5vw'
            }}>
              <h3 style={{ fontSize: '0.95vw', fontWeight: 500, color: '#4B0082', marginBottom: '0.5vw' }}>
                Coaching Arc
              </h3>
              <p style={{ fontSize: '0.8vw', color: '#666', lineHeight: 1.6, margin: 0 }}>
                Opening → Exploration → Insight → Action → Closing
              </p>
            </div>

            <h3 style={{
              fontSize: '0.95vw',
              fontWeight: 500,
              color: '#1a1a1a',
              marginBottom: '1vw'
            }}>
              Starters
            </h3>
            
            {[
              "I'm struggling with a conflict...",
              "I notice I keep rescuing...",
              "How do I set boundaries?",
            ].map((starter, i) => (
              <button
                key={i}
                onClick={() => setInput(starter)}
                disabled={sessionEnded}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '0.8vw 1vw',
                  marginBottom: '0.5vw',
                  fontSize: '0.85vw',
                  color: sessionEnded ? '#999' : '#3D5A4C',
                  backgroundColor: 'transparent',
                  border: '1px solid #e0e0e0',
                  borderRadius: '0.5vw',
                  textAlign: 'left',
                  cursor: sessionEnded ? 'not-allowed' : 'pointer',
                  opacity: sessionEnded ? 0.5 : 1
                }}
              >
                {starter}
              </button>
            ))}
          </>
        )}
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