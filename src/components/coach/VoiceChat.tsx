'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
]

const getSystemPrompt = (languageCode: string) => {
  const languageName = LANGUAGES.find(l => l.code === languageCode)?.name || 'English'
  
  return `You are a Compassion Coach, an ICF-certified professional coach specializing in Dr. Stephen Karpman's Drama Triangle and Compassion Triangle frameworks. You are having a VOICE conversation, so keep responses conversational, warm, and concise.

## VOICE CONVERSATION GUIDELINES
- Speak naturally as if in person - use conversational language
- Keep responses SHORT (2-4 sentences typically, maximum 5-6 for complex topics)
- Don't use bullet points, lists, or formatting - speak in flowing sentences
- Be warm, empathetic, but professional
- The person is speaking to you in ${languageName} - respond in the same language

## ICF CORE COMPETENCIES
You embody all ICF coaching competencies:

1. DEMONSTRATES ETHICAL PRACTICE - Maintain confidentiality, refer out when needed
2. EMBODIES A COACHING MINDSET - Trust the client is resourceful and whole
3. ESTABLISHES AND MAINTAINS AGREEMENTS - Partner on what to explore
4. CULTIVATES TRUST AND SAFETY - Create safe space, be non-judgmental
5. MAINTAINS PRESENCE - Be fully present, trust your intuition
6. LISTENS ACTIVELY - Listen for what's said and unsaid
7. EVOKES AWARENESS - Ask powerful questions
8. FACILITATES CLIENT GROWTH - Support them in designing goals and actions

## DRAMA TRIANGLE EXPERTISE
THE THREE DRAMA ROLES:
- VICTIM: "Poor me" - Feels helpless, avoids responsibility
- PERSECUTOR: "It's all your fault" - Criticizes, blames, attacks
- RESCUER: "Let me help you" - Helps in ways that create dependency

## COMPASSION TRIANGLE - THE HEALTHY ALTERNATIVE
- VULNERABLE (instead of Victim): Owns feelings while maintaining capability
- ASSERTIVE (instead of Persecutor): Sets boundaries without attacking
- CARING (instead of Rescuer): Supports without creating dependency

## IMPORTANT: ACTION COMMITMENTS
Toward the end of each session, help the client identify ONE specific action they commit to taking. Ask:
- "What's one thing you could do differently this week?"
- "What small step could you take?"
- "When specifically will you try this?"
- "How will you hold yourself accountable?"

Remember: Be natural, warm, genuinely curious. Help them discover their own wisdom. Respond in ${languageName}.`
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface VoiceChatProps {
  onTranscript?: (text: string, role: 'user' | 'assistant') => void
  onSessionEnd?: (summary: SessionSummary) => void
}

interface SessionSummary {
  summary: string
  keyInsights: string[]
  dramaPatterns: string[]
  compassionShift: string
  actions: Array<{
    action: string
    timeline: string
    accountability: string
  }>
  sessionTopic: string
}

export function VoiceChat({ onTranscript, onSessionEnd }: VoiceChatProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [status, setStatus] = useState<string>('Ready to connect')
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [showLanguages, setShowLanguages] = useState(false)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  
  const peerConnection = useRef<RTCPeerConnection | null>(null)
  const dataChannel = useRef<RTCDataChannel | null>(null)
  const audioElement = useRef<HTMLAudioElement | null>(null)
  const mediaStream = useRef<MediaStream | null>(null)
  const messagesRef = useRef<Message[]>([])

  useEffect(() => {
    return () => {
      cleanupConnection()
    }
  }, [])

  const cleanupConnection = () => {
    if (dataChannel.current) { dataChannel.current.close(); dataChannel.current = null }
    if (peerConnection.current) { peerConnection.current.close(); peerConnection.current = null }
    if (mediaStream.current) { mediaStream.current.getTracks().forEach(track => track.stop()); mediaStream.current = null }
    if (audioElement.current) { audioElement.current.srcObject = null; audioElement.current = null }
  }

  const getGreeting = (lang: string): string => {
    const greetings: Record<string, string> = {
      en: "Hello, I'm your Compassion Coach. I'm here to support you today. What's on your mind? What would you like to explore?",
      es: "Hola, soy tu Coach de Compasión. Estoy aquí para apoyarte hoy. ¿Qué tienes en mente?",
      fr: "Bonjour, je suis votre Coach de Compassion. Je suis là pour vous accompagner. Qu'avez-vous en tête?",
      de: "Hallo, ich bin Ihr Mitgefühls-Coach. Was beschäftigt Sie heute?",
      it: "Ciao, sono il tuo Coach della Compassione. Cosa hai in mente oggi?",
      pt: "Olá, sou seu Coach de Compaixão. O que está em sua mente?",
      ja: "こんにちは、私はあなたのコンパッションコーチです。今日は何を考えていますか？",
      ko: "안녕하세요, 저는 당신의 컴패션 코치입니다. 무슨 생각을 하고 계세요?",
      zh: "你好，我是你的慈悲教练。你在想什么？",
    }
    return greetings[lang] || greetings.en
  }

  const handleRealtimeEvent = (event: { type: string; transcript?: string; error?: { message?: string } }) => {
    switch (event.type) {
      case 'response.audio.started':
        setIsAISpeaking(true)
        setStatus('Coach is speaking...')
        break
      case 'response.audio.done':
      case 'response.done':
        setIsAISpeaking(false)
        setStatus('Listening...')
        break
      case 'input_audio_buffer.speech_started':
        setStatus('You are speaking...')
        break
      case 'input_audio_buffer.speech_stopped':
        setStatus('Processing...')
        break
      case 'conversation.item.input_audio_transcription.completed':
        if (event.transcript) {
          messagesRef.current.push({ role: 'user', content: event.transcript })
          if (onTranscript) onTranscript(event.transcript, 'user')
        }
        break
      case 'response.audio_transcript.done':
        if (event.transcript) {
          messagesRef.current.push({ role: 'assistant', content: event.transcript })
          if (onTranscript) onTranscript(event.transcript, 'assistant')
        }
        break
      case 'error':
        console.error('Realtime error:', event.error)
        setStatus(`Error: ${event.error?.message || 'Unknown error'}`)
        break
    }
  }

  const connectSession = async () => {
    setIsConnecting(true)
    setStatus('Requesting microphone access...')
    messagesRef.current = []
    setSessionSummary(null)
    setShowSummary(false)

    try {
      mediaStream.current = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 24000 } 
      })
      
      setStatus('Connecting to your coach...')

      const tokenResponse = await fetch('/api/voice/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          language: selectedLanguage,
          systemPrompt: getSystemPrompt(selectedLanguage)
        }),
      })

      if (!tokenResponse.ok) throw new Error('Failed to get session token')

      const { client_secret } = await tokenResponse.json()

      peerConnection.current = new RTCPeerConnection()
      audioElement.current = new Audio()
      audioElement.current.autoplay = true

      peerConnection.current.ontrack = (event) => {
        if (audioElement.current) audioElement.current.srcObject = event.streams[0]
      }

      mediaStream.current.getTracks().forEach(track => {
        peerConnection.current?.addTrack(track, mediaStream.current!)
      })

      dataChannel.current = peerConnection.current.createDataChannel('oai-events')
      
      dataChannel.current.onopen = () => {
        const sessionUpdate = {
          type: 'session.update',
          session: {
            instructions: getSystemPrompt(selectedLanguage),
            voice: 'alloy',
            input_audio_transcription: { model: 'whisper-1' },
            turn_detection: { type: 'server_vad', threshold: 0.5, prefix_padding_ms: 300, silence_duration_ms: 700 },
          },
        }
        dataChannel.current?.send(JSON.stringify(sessionUpdate))
        
        setTimeout(() => {
          const greeting = getGreeting(selectedLanguage)
          messagesRef.current.push({ role: 'assistant', content: greeting })
          const responseCreate = {
            type: 'response.create',
            response: {
              modalities: ['text', 'audio'],
              instructions: `Say this greeting naturally and warmly: "${greeting}"`,
            },
          }
          dataChannel.current?.send(JSON.stringify(responseCreate))
        }, 500)
      }

      dataChannel.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        handleRealtimeEvent(data)
      }

      const offer = await peerConnection.current.createOffer()
      await peerConnection.current.setLocalDescription(offer)

      const sdpResponse = await fetch('https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${client_secret.value}`,
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      })

      if (!sdpResponse.ok) throw new Error('Failed to connect to voice service')

      const answerSdp = await sdpResponse.text()
      await peerConnection.current.setRemoteDescription({ type: 'answer', sdp: answerSdp })

      setIsConnected(true)
      setStatus('Connected - Speak naturally')
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Connection error:', error)
      setStatus(`Error: ${errorMessage}`)
      cleanupConnection()
    } finally {
      setIsConnecting(false)
    }
  }

  const generateAndSaveSummary = async () => {
    if (messagesRef.current.length < 2) {
      setStatus('Session ended')
      return
    }

    setIsGeneratingSummary(true)
    setStatus('Generating session summary...')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const response = await fetch('/api/session/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesRef.current,
          userId: user?.id
        }),
      })

      if (!response.ok) throw new Error('Failed to generate summary')

      const summaryData = await response.json()
      setSessionSummary(summaryData)
      setShowSummary(true)

      // Save actions to Supabase if user is logged in
      if (user && summaryData.actions && summaryData.actions.length > 0) {
        for (const action of summaryData.actions) {
          await supabase.from('actions').insert({
            user_id: user.id,
            action: action.action,
            timeline: action.timeline,
            accountability: action.accountability,
            session_topic: summaryData.sessionTopic,
            completed: false,
            created_at: new Date().toISOString()
          })
        }
      }

      // Save session to Supabase
      if (user) {
        await supabase.from('sessions').insert({
          user_id: user.id,
          type: 'coach',
          topic: summaryData.sessionTopic,
          summary: summaryData.summary,
          key_insights: summaryData.keyInsights,
          drama_patterns: summaryData.dramaPatterns,
          compassion_shift: summaryData.compassionShift,
          duration_minutes: Math.round(messagesRef.current.length * 0.5),
          created_at: new Date().toISOString()
        })
      }

      if (onSessionEnd) onSessionEnd(summaryData)
      setStatus('Session complete!')

    } catch (error) {
      console.error('Summary error:', error)
      setStatus('Session ended')
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  const disconnectSession = useCallback(async () => {
    cleanupConnection()
    setIsConnected(false)
    setIsAISpeaking(false)
    await generateAndSaveSummary()
  }, [])

  const toggleMute = () => {
    if (mediaStream.current) {
      const audioTrack = mediaStream.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = isMuted
        setIsMuted(!isMuted)
      }
    }
  }

  const toggleSpeaker = () => {
    if (audioElement.current) {
      audioElement.current.muted = isSpeakerOn
      setIsSpeakerOn(!isSpeakerOn)
    }
  }

  const startNewSession = () => {
    setShowSummary(false)
    setSessionSummary(null)
    setStatus('Ready to connect')
  }

  // Show session summary after ending
  if (showSummary && sessionSummary) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '2vw', backgroundColor: '#FAFAF8', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '1.5vw', fontWeight: 500, color: '#1a1a1a', fontFamily: 'Georgia, serif', marginBottom: '1vw' }}>
          Session Complete ✓
        </h2>
        
        {/* Summary */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '0.8vw', padding: '1.5vw', marginBottom: '1.5vw', border: '1px solid #e8e8e8' }}>
          <h3 style={{ fontSize: '1vw', fontWeight: 500, color: '#3D5A4C', marginBottom: '0.5vw' }}>Summary</h3>
          <p style={{ fontSize: '0.95vw', color: '#333', lineHeight: 1.6, margin: 0 }}>{sessionSummary.summary}</p>
        </div>

        {/* Key Insights */}
        {sessionSummary.keyInsights && sessionSummary.keyInsights.length > 0 && (
          <div style={{ backgroundColor: '#F0F7F4', borderRadius: '0.8vw', padding: '1.5vw', marginBottom: '1.5vw' }}>
            <h3 style={{ fontSize: '1vw', fontWeight: 500, color: '#3D5A4C', marginBottom: '0.8vw' }}>Key Insights</h3>
            {sessionSummary.keyInsights.map((insight, i) => (
              <p key={i} style={{ fontSize: '0.9vw', color: '#333', margin: '0 0 0.5vw 0', paddingLeft: '1vw', borderLeft: '2px solid #3D5A4C' }}>
                {insight}
              </p>
            ))}
          </div>
        )}

        {/* Drama Patterns */}
        {sessionSummary.dramaPatterns && sessionSummary.dramaPatterns.length > 0 && (
          <div style={{ backgroundColor: '#FFF8F0', borderRadius: '0.8vw', padding: '1.5vw', marginBottom: '1.5vw' }}>
            <h3 style={{ fontSize: '1vw', fontWeight: 500, color: '#8B4513', marginBottom: '0.8vw' }}>Drama Patterns Noticed</h3>
            {sessionSummary.dramaPatterns.map((pattern, i) => (
              <p key={i} style={{ fontSize: '0.9vw', color: '#333', margin: '0 0 0.5vw 0' }}>• {pattern}</p>
            ))}
          </div>
        )}

        {/* Compassion Shift */}
        {sessionSummary.compassionShift && (
          <div style={{ backgroundColor: '#F5F5FF', borderRadius: '0.8vw', padding: '1.5vw', marginBottom: '1.5vw' }}>
            <h3 style={{ fontSize: '1vw', fontWeight: 500, color: '#4B0082', marginBottom: '0.5vw' }}>Movement Toward Compassion</h3>
            <p style={{ fontSize: '0.9vw', color: '#333', margin: 0, lineHeight: 1.6 }}>{sessionSummary.compassionShift}</p>
          </div>
        )}

        {/* Committed Actions */}
        {sessionSummary.actions && sessionSummary.actions.length > 0 && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '0.8vw', padding: '1.5vw', marginBottom: '1.5vw', border: '2px solid #3D5A4C' }}>
            <h3 style={{ fontSize: '1vw', fontWeight: 500, color: '#3D5A4C', marginBottom: '1vw' }}>✓ Committed Actions</h3>
            {sessionSummary.actions.map((action, i) => (
              <div key={i} style={{ padding: '1vw', backgroundColor: '#F0F7F4', borderRadius: '0.5vw', marginBottom: '0.8vw' }}>
                <p style={{ fontSize: '0.95vw', color: '#1a1a1a', margin: 0, fontWeight: 500 }}>{action.action}</p>
                <p style={{ fontSize: '0.8vw', color: '#666', margin: '0.3vw 0 0 0' }}>
                  📅 {action.timeline} • ✓ {action.accountability}
                </p>
              </div>
            ))}
            <p style={{ fontSize: '0.8vw', color: '#3D5A4C', margin: '1vw 0 0 0', fontStyle: 'italic' }}>
              Actions saved to your Actions page
            </p>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '1vw', marginTop: '1vw' }}>
          <button
            onClick={startNewSession}
            style={{ flex: 1, padding: '1vw', backgroundColor: '#3D5A4C', color: '#fff', border: 'none', borderRadius: '0.5vw', fontSize: '1vw', cursor: 'pointer' }}
          >
            Start New Session
          </button>
          <button
            onClick={() => window.location.href = '/actions'}
            style={{ flex: 1, padding: '1vw', backgroundColor: '#ffffff', color: '#3D5A4C', border: '1px solid #3D5A4C', borderRadius: '0.5vw', fontSize: '1vw', cursor: 'pointer' }}
          >
            View All Actions
          </button>
        </div>
      </div>
    )
  }

  // Generating summary state
  if (isGeneratingSummary) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '3vw', backgroundColor: '#FAFAF8' }}>
        <div style={{ width: '8vw', height: '8vw', borderRadius: '50%', backgroundColor: '#F0F7F4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2vw' }}>
          <span style={{ fontSize: '3vw', animation: 'spin 2s linear infinite' }}>⏳</span>
        </div>
        <p style={{ fontSize: '1.2vw', color: '#3D5A4C', fontWeight: 500 }}>Generating session summary...</p>
        <p style={{ fontSize: '0.9vw', color: '#666' }}>Extracting insights and actions</p>
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '3vw', backgroundColor: '#FAFAF8' }}>
      <h1 style={{ fontSize: '1.8vw', fontWeight: 500, color: '#1a1a1a', fontFamily: 'Georgia, serif', marginBottom: '0.5vw' }}>Compassion Coach</h1>
      <p style={{ fontSize: '0.95vw', color: '#666', marginBottom: '2vw' }}>ICF-style coaching for Drama Triangle awareness</p>

      <div style={{ position: 'relative', marginBottom: '2vw' }}>
        <div style={{
          width: '12vw', height: '12vw', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease',
          backgroundColor: isConnected ? (isAISpeaking ? '#4B0082' : '#3D5A4C') : '#e8e8e8',
          boxShadow: isConnected ? (isAISpeaking ? '0 0 60px rgba(75, 0, 130, 0.5)' : '0 0 40px rgba(61, 90, 76, 0.3)') : 'none'
        }}>
          <span style={{ fontSize: '3.5vw' }}>{isConnected ? (isAISpeaking ? '🗣️' : '👂') : '🎙️'}</span>
        </div>
      </div>

      <p style={{ fontSize: '1.2vw', color: isConnected ? '#3D5A4C' : '#666', marginBottom: '0.5vw', textAlign: 'center', fontWeight: 500 }}>{status}</p>

      {isConnected && (
        <p style={{ fontSize: '0.9vw', color: '#999', marginBottom: '1.5vw', textAlign: 'center' }}>
          {isAISpeaking ? 'Listen to your coach...' : 'Speak naturally - I\'m listening'}
        </p>
      )}

      {!isConnected && (
        <div style={{ position: 'relative', marginBottom: '1.5vw' }}>
          <button onClick={() => setShowLanguages(!showLanguages)} style={{ display: 'flex', alignItems: 'center', gap: '0.6vw', padding: '0.6vw 1.2vw', backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '0.5vw', cursor: 'pointer', fontSize: '0.9vw' }}>
            <span>🌐</span>
            <span>{LANGUAGES.find(l => l.code === selectedLanguage)?.flag}</span>
            <span>{LANGUAGES.find(l => l.code === selectedLanguage)?.name}</span>
          </button>
          
          {showLanguages && (
            <div style={{ position: 'absolute', bottom: '100%', marginBottom: '0.5vw', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '0.5vw', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', padding: '0.5vw', minWidth: '12vw', maxHeight: '20vw', overflowY: 'auto', zIndex: 50 }}>
              {LANGUAGES.map(lang => (
                <button key={lang.code} onClick={() => { setSelectedLanguage(lang.code); setShowLanguages(false) }} style={{ width: '100%', textAlign: 'left', padding: '0.5vw 0.8vw', borderRadius: '0.3vw', border: 'none', backgroundColor: selectedLanguage === lang.code ? '#F0F7F4' : 'transparent', color: selectedLanguage === lang.code ? '#3D5A4C' : '#333', cursor: 'pointer', fontSize: '0.85vw', display: 'flex', alignItems: 'center', gap: '0.6vw' }}>
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2vw' }}>
        {isConnected ? (
          <>
            <button onClick={toggleMute} style={{ width: '3.5vw', height: '3.5vw', borderRadius: '50%', border: 'none', cursor: 'pointer', backgroundColor: isMuted ? 'rgba(168, 84, 84, 0.15)' : '#f0f0f0', fontSize: '1.3vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted ? '🔇' : '🎤'}
            </button>
            <button onClick={disconnectSession} style={{ width: '4.5vw', height: '4.5vw', borderRadius: '50%', border: 'none', cursor: 'pointer', backgroundColor: '#A85454', color: '#ffffff', fontSize: '1.5vw', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(168, 84, 84, 0.4)' }} title="End session">
              📵
            </button>
            <button onClick={toggleSpeaker} style={{ width: '3.5vw', height: '3.5vw', borderRadius: '50%', border: 'none', cursor: 'pointer', backgroundColor: !isSpeakerOn ? 'rgba(168, 84, 84, 0.15)' : '#f0f0f0', fontSize: '1.3vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={isSpeakerOn ? 'Mute speaker' : 'Unmute speaker'}>
              {isSpeakerOn ? '🔊' : '🔈'}
            </button>
          </>
        ) : (
          <button onClick={connectSession} disabled={isConnecting} style={{ display: 'flex', alignItems: 'center', gap: '0.8vw', padding: '1vw 2.5vw', backgroundColor: isConnecting ? '#ccc' : '#3D5A4C', color: '#ffffff', border: 'none', borderRadius: '3vw', cursor: isConnecting ? 'not-allowed' : 'pointer', fontSize: '1vw', fontWeight: 500, boxShadow: isConnecting ? 'none' : '0 4px 20px rgba(61, 90, 76, 0.4)' }}>
            {isConnecting ? '⏳ Connecting...' : '📞 Start Coaching Session'}
          </button>
        )}
      </div>

      {!isConnected && !showSummary && (
        <p style={{ fontSize: '0.85vw', color: '#999', marginTop: '2vw', textAlign: 'center', maxWidth: '25vw', lineHeight: 1.6 }}>
          Start a voice conversation with your ICF-trained coach. Actions you commit to will be saved automatically.
        </p>
      )}
    </div>
  )
}
