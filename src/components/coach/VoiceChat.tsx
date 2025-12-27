'use client'

import { useState, useRef, useEffect } from 'react'
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
  
  return `You are a Compassion Coach. You are having a VOICE conversation. Respond in ${languageName}.

## CRITICAL RULES - FOLLOW EXACTLY

1. **STOP AFTER EVERY RESPONSE** - After you speak, STOP COMPLETELY. Do not continue. Wait for the client.

2. **ONE QUESTION ONLY** - Each turn, you say ONE thing (a brief reflection or acknowledgment) and ask ONE question. Then STOP.

3. **NEVER SPEAK TWICE** - If you just spoke, wait for the client. Do not fill silence.

4. **2 SENTENCES MAX** - Keep responses very short.

CORRECT example:
Coach: "That sounds challenging. What would help most right now?" [STOP]
[Wait for client to speak]

WRONG example:  
Coach: "That sounds hard. What's been happening? How long has this been going on? What have you tried?" [TOO MANY QUESTIONS]

## COACHING FLOW

Turn 1 (greeting): "Hello, I'm your Compassion Coach. What would you like to focus on today?" [STOP]

Turn 2 (after they share): Reflect briefly + ask "Why is this important to you right now?" [STOP]

Turn 3 (after they answer): Reflect + ask "What would you like to be different?" [STOP]

Then continue with ONE question per turn:
- "Tell me more about that."
- "What are you noticing?"
- "What patterns do you see?"
- "What options do you have?"
- "What's one small step you could take?"

## DRAMA TRIANGLE

If you notice Victim/Persecutor/Rescuer patterns, gently ask:
- Victim: "What IS within your control here?"
- Persecutor: "What do you need?"
- Rescuer: "How can you support without taking over?"

## RULES
- Never give advice
- Never lecture
- Never ask multiple questions
- Always STOP after speaking and WAIT`
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface SessionSummary {
  summary: string
  keyInsights: string[]
  dramaPatterns: string[]
  compassionShift: string
  actions: Array<{ action: string; timeline: string; accountability: string }>
  sessionTopic: string
}

const injectStyles = () => {
  if (typeof document !== 'undefined' && !document.getElementById('voice-chat-styles')) {
    const style = document.createElement('style')
    style.id = 'voice-chat-styles'
    style.textContent = `
      @keyframes soundBar1 { 0%, 100% { height: 0.6vw; } 50% { height: 2vw; } }
      @keyframes soundBar2 { 0%, 100% { height: 0.8vw; } 50% { height: 2.5vw; } }
      @keyframes soundBar3 { 0%, 100% { height: 1vw; } 50% { height: 3vw; } }
      @keyframes soundBar4 { 0%, 100% { height: 0.8vw; } 50% { height: 2.5vw; } }
      @keyframes soundBar5 { 0%, 100% { height: 0.6vw; } 50% { height: 2vw; } }
    `
    document.head.appendChild(style)
  }
}

export function VoiceChat() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [status, setStatus] = useState('Ready to connect')
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
    injectStyles()
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
      en: "Hello, I'm your Compassion Coach. What would you like to focus on today?",
      es: "Hola, soy tu Coach. ¿En qué te gustaría enfocarte hoy?",
      fr: "Bonjour, je suis votre Coach. Sur quoi aimeriez-vous travailler aujourd'hui?",
      de: "Hallo, ich bin Ihr Coach. Worauf möchten Sie sich heute konzentrieren?",
      it: "Ciao, sono il tuo Coach. Su cosa vorresti concentrarti oggi?",
      pt: "Olá, sou seu Coach. No que você gostaria de focar hoje?",
      ja: "こんにちは、コーチです。今日は何について話したいですか？",
      ko: "안녕하세요, 코치입니다. 오늘 무엇에 대해 이야기하고 싶으신가요?",
      zh: "你好，我是你的教练。今天你想谈什么？",
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
        setStatus('Your turn - speak when ready')
        break
      case 'input_audio_buffer.speech_started':
        setStatus('Listening...')
        break
      case 'input_audio_buffer.speech_stopped':
        setStatus('Processing...')
        break
      case 'conversation.item.input_audio_transcription.completed':
        if (event.transcript) {
          messagesRef.current.push({ role: 'user', content: event.transcript })
        }
        break
      case 'response.audio_transcript.done':
        if (event.transcript) {
          messagesRef.current.push({ role: 'assistant', content: event.transcript })
        }
        break
      case 'error':
        console.error('Realtime error:', event.error)
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
        body: JSON.stringify({ language: selectedLanguage, systemPrompt: getSystemPrompt(selectedLanguage) }),
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
        dataChannel.current?.send(JSON.stringify({
          type: 'session.update',
          session: {
            instructions: getSystemPrompt(selectedLanguage),
            voice: 'alloy',
            input_audio_transcription: { model: 'whisper-1' },
            turn_detection: { 
              type: 'server_vad', 
              threshold: 0.8,
              prefix_padding_ms: 500,
              silence_duration_ms: 2000,
            },
          },
        }))
        
        setTimeout(() => {
          const greeting = getGreeting(selectedLanguage)
          messagesRef.current.push({ role: 'assistant', content: greeting })
          dataChannel.current?.send(JSON.stringify({
            type: 'conversation.item.create',
            item: {
              type: 'message',
              role: 'assistant',
              content: [{ type: 'text', text: greeting }]
            }
          }))
          dataChannel.current?.send(JSON.stringify({
            type: 'response.create',
            response: { 
              modalities: ['audio'],
              instructions: 'Say the greeting exactly as provided, then stop completely. Do not say anything else. Do not ask follow-up questions. Wait for the user to speak first.'
            },
          }))
        }, 1000)
      }

      dataChannel.current.onmessage = (event) => handleRealtimeEvent(JSON.parse(event.data))

      const offer = await peerConnection.current.createOffer()
      await peerConnection.current.setLocalDescription(offer)

      const sdpResponse = await fetch('https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${client_secret.value}`, 'Content-Type': 'application/sdp' },
        body: offer.sdp,
      })

      if (!sdpResponse.ok) throw new Error('Failed to connect')

      await peerConnection.current.setRemoteDescription({ type: 'answer', sdp: await sdpResponse.text() })
      setIsConnected(true)
      setStatus('Connected')
      
    } catch (error) {
      console.error('Connection error:', error)
      setStatus('Error connecting')
      cleanupConnection()
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectSession = async () => {
    cleanupConnection()
    setIsConnected(false)
    setIsAISpeaking(false)

    if (messagesRef.current.length < 2) {
      setStatus('Session ended')
      return
    }

    setIsGeneratingSummary(true)
    setStatus('Generating summary...')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const response = await fetch('/api/session/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesRef.current, userId: user?.id }),
      })

      if (response.ok) {
        const summaryData = await response.json()
        setSessionSummary(summaryData)
        setShowSummary(true)

        if (user && summaryData.actions && summaryData.actions.length > 0) {
          for (const action of summaryData.actions) {
            await supabase.from('actions').insert({
              user_id: user.id,
              action: action.action,
              timeline: action.timeline,
              accountability: action.accountability,
              session_topic: summaryData.sessionTopic,
              completed: false,
            })
          }
        }

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
          })
        }
      }
    } catch (error) {
      console.error('Summary error:', error)
    } finally {
      setIsGeneratingSummary(false)
      setStatus('Session complete')
    }
  }

  const toggleMute = () => {
    if (mediaStream.current) {
      const track = mediaStream.current.getAudioTracks()[0]
      if (track) { track.enabled = isMuted; setIsMuted(!isMuted) }
    }
  }

  const toggleSpeaker = () => {
    if (audioElement.current) { audioElement.current.muted = isSpeakerOn; setIsSpeakerOn(!isSpeakerOn) }
  }

  const SoundBars = ({ isActive, color }: { isActive: boolean; color: string }) => {
    const bars = [
      { animation: 'soundBar1 0.5s ease-in-out infinite', delay: '0s' },
      { animation: 'soundBar2 0.5s ease-in-out infinite', delay: '0.1s' },
      { animation: 'soundBar3 0.5s ease-in-out infinite', delay: '0.2s' },
      { animation: 'soundBar4 0.5s ease-in-out infinite', delay: '0.1s' },
      { animation: 'soundBar5 0.5s ease-in-out infinite', delay: '0s' },
    ]
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3vw', height: '3vw' }}>
        {bars.map((bar, i) => (
          <div
            key={i}
            style={{
              width: '0.4vw',
              height: isActive ? undefined : '0.8vw',
              backgroundColor: color,
              borderRadius: '0.2vw',
              animation: isActive ? bar.animation : 'none',
              animationDelay: bar.delay,
            }}
          />
        ))}
      </div>
    )
  }

  if (showSummary && sessionSummary) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '2vw', backgroundColor: '#FAFAF8', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '1.5vw', fontWeight: 500, color: '#1a1a1a', marginBottom: '1vw', fontFamily: 'Georgia, serif' }}>Session Complete</h2>
        
        <div style={{ backgroundColor: '#fff', borderRadius: '0.8vw', padding: '1.5vw', marginBottom: '1vw', border: '1px solid #e8e8e8' }}>
          <h3 style={{ fontSize: '1vw', color: '#3D5A4C', marginBottom: '0.5vw', fontWeight: 500 }}>Summary</h3>
          <p style={{ fontSize: '0.95vw', color: '#333', margin: 0, lineHeight: 1.6 }}>{String(sessionSummary.summary || '')}</p>
        </div>

        {sessionSummary.keyInsights && sessionSummary.keyInsights.length > 0 && (
          <div style={{ backgroundColor: '#F0F7F4', borderRadius: '0.8vw', padding: '1.5vw', marginBottom: '1vw' }}>
            <h3 style={{ fontSize: '1vw', color: '#3D5A4C', marginBottom: '0.8vw', fontWeight: 500 }}>Key Insights</h3>
            {sessionSummary.keyInsights.map((insight, i) => (
              <p key={i} style={{ fontSize: '0.9vw', color: '#333', margin: '0 0 0.5vw 0', paddingLeft: '1vw', borderLeft: '2px solid #3D5A4C', lineHeight: 1.5 }}>{String(insight)}</p>
            ))}
          </div>
        )}

        {sessionSummary.dramaPatterns && sessionSummary.dramaPatterns.length > 0 && (
          <div style={{ backgroundColor: '#FFF8F0', borderRadius: '0.8vw', padding: '1.5vw', marginBottom: '1vw' }}>
            <h3 style={{ fontSize: '1vw', color: '#8B4513', marginBottom: '0.8vw', fontWeight: 500 }}>Drama Triangle Patterns Noticed</h3>
            {sessionSummary.dramaPatterns.map((pattern, i) => (
              <p key={i} style={{ fontSize: '0.9vw', color: '#333', margin: '0 0 0.5vw 0', lineHeight: 1.5 }}>• {String(pattern)}</p>
            ))}
          </div>
        )}

        {sessionSummary.compassionShift && (
          <div style={{ backgroundColor: '#F5F5FF', borderRadius: '0.8vw', padding: '1.5vw', marginBottom: '1vw' }}>
            <h3 style={{ fontSize: '1vw', color: '#4B0082', marginBottom: '0.5vw', fontWeight: 500 }}>Movement Toward Compassion</h3>
            <p style={{ fontSize: '0.9vw', color: '#333', margin: 0, lineHeight: 1.6 }}>{String(sessionSummary.compassionShift)}</p>
          </div>
        )}

        {sessionSummary.actions && sessionSummary.actions.length > 0 && (
          <div style={{ backgroundColor: '#fff', borderRadius: '0.8vw', padding: '1.5vw', marginBottom: '1vw', border: '2px solid #3D5A4C' }}>
            <h3 style={{ fontSize: '1vw', color: '#3D5A4C', marginBottom: '1vw', fontWeight: 500 }}>Committed Actions</h3>
            {sessionSummary.actions.map((action, i) => (
              <div key={i} style={{ padding: '1vw', backgroundColor: '#F0F7F4', borderRadius: '0.5vw', marginBottom: '0.5vw' }}>
                <p style={{ fontSize: '0.95vw', color: '#1a1a1a', margin: 0, fontWeight: 500, lineHeight: 1.5 }}>{String(action.action)}</p>
                <p style={{ fontSize: '0.8vw', color: '#666', margin: '0.3vw 0 0 0' }}>Timeline: {String(action.timeline || 'Not specified')} | Accountability: {String(action.accountability || 'Self')}</p>
              </div>
            ))}
            <p style={{ fontSize: '0.8vw', color: '#3D5A4C', margin: '1vw 0 0 0', fontStyle: 'italic' }}>Actions saved to your Actions page</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1vw', marginTop: '1vw' }}>
          <button onClick={() => { setShowSummary(false); setSessionSummary(null); setStatus('Ready to connect') }} style={{ flex: 1, padding: '1vw', backgroundColor: '#3D5A4C', color: '#fff', border: 'none', borderRadius: '0.5vw', cursor: 'pointer', fontSize: '0.95vw', fontWeight: 500 }}>
            Start New Session
          </button>
          <button onClick={() => window.location.href = '/actions'} style={{ flex: 1, padding: '1vw', backgroundColor: '#fff', color: '#3D5A4C', border: '1px solid #3D5A4C', borderRadius: '0.5vw', cursor: 'pointer', fontSize: '0.95vw', fontWeight: 500 }}>
            View All Actions
          </button>
        </div>
      </div>
    )
  }

  if (isGeneratingSummary) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#FAFAF8' }}>
        <div style={{ width: '8vw', height: '8vw', borderRadius: '50%', backgroundColor: '#3D5A4C', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5vw' }}>
          <SoundBars isActive={true} color="rgba(255,255,255,0.9)" />
        </div>
        <p style={{ fontSize: '1.2vw', color: '#3D5A4C', fontWeight: 500 }}>Generating session summary...</p>
        <p style={{ fontSize: '0.9vw', color: '#666' }}>Extracting insights and actions</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '3vw', backgroundColor: '#FAFAF8' }}>
      <div style={{ position: 'relative', marginBottom: '2vw' }}>
        <div style={{
          width: '12vw', 
          height: '12vw', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: isConnected ? (isAISpeaking ? '#4B0082' : '#3D5A4C') : '#e8e8e8',
          boxShadow: isConnected ? (isAISpeaking ? '0 0 40px rgba(75,0,130,0.4)' : '0 0 30px rgba(61,90,76,0.3)') : 'none',
          transition: 'all 0.3s ease'
        }}>
          <SoundBars 
            isActive={isConnected && isAISpeaking} 
            color={isConnected ? 'rgba(255,255,255,0.9)' : '#999'} 
          />
        </div>
      </div>

      <p style={{ fontSize: '1.2vw', color: isConnected ? '#3D5A4C' : '#666', marginBottom: '0.5vw', fontWeight: 500 }}>{status}</p>
      
      {isConnected && (
        <p style={{ fontSize: '0.9vw', color: '#999', marginBottom: '1.5vw' }}>
          {isAISpeaking ? 'Listen to your coach...' : 'Take your time - speak when ready'}
        </p>
      )}

      {!isConnected && (
        <div style={{ position: 'relative', marginBottom: '1.5vw' }}>
          <button onClick={() => setShowLanguages(!showLanguages)} style={{ display: 'flex', alignItems: 'center', gap: '0.6vw', padding: '0.6vw 1.2vw', backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '0.5vw', cursor: 'pointer', fontSize: '0.9vw' }}>
            {LANGUAGES.find(l => l.code === selectedLanguage)?.flag} {LANGUAGES.find(l => l.code === selectedLanguage)?.name}
          </button>
          {showLanguages && (
            <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '0.5vw', padding: '0.5vw', marginBottom: '0.5vw', zIndex: 50, minWidth: '10vw' }}>
              {LANGUAGES.map(lang => (
                <button key={lang.code} onClick={() => { setSelectedLanguage(lang.code); setShowLanguages(false) }} style={{ display: 'block', width: '100%', padding: '0.5vw 0.8vw', border: 'none', backgroundColor: selectedLanguage === lang.code ? '#F0F7F4' : 'transparent', cursor: 'pointer', textAlign: 'left', fontSize: '0.85vw', borderRadius: '0.3vw' }}>
                  {lang.flag} {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
        {isConnected ? (
          <>
            <button onClick={toggleMute} style={{ width: '3.5vw', height: '3.5vw', borderRadius: '50%', border: 'none', cursor: 'pointer', backgroundColor: isMuted ? 'rgba(168,84,84,0.15)' : '#f0f0f0', fontSize: '1.3vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted ? '🔇' : '🎤'}
            </button>
            <button onClick={disconnectSession} style={{ padding: '0.8vw 1.5vw', borderRadius: '2vw', border: 'none', cursor: 'pointer', backgroundColor: '#A85454', color: '#fff', fontSize: '0.95vw', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5vw', boxShadow: '0 4px 15px rgba(168,84,84,0.3)', fontWeight: 500 }}>
              End Session
            </button>
            <button onClick={toggleSpeaker} style={{ width: '3.5vw', height: '3.5vw', borderRadius: '50%', border: 'none', cursor: 'pointer', backgroundColor: !isSpeakerOn ? 'rgba(168,84,84,0.15)' : '#f0f0f0', fontSize: '1.3vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={isSpeakerOn ? 'Mute speaker' : 'Unmute speaker'}>
              {isSpeakerOn ? '🔊' : '🔈'}
            </button>
          </>
        ) : (
          <button onClick={connectSession} disabled={isConnecting} style={{ padding: '1vw 2.5vw', backgroundColor: isConnecting ? '#ccc' : '#3D5A4C', color: '#fff', border: 'none', borderRadius: '3vw', cursor: isConnecting ? 'not-allowed' : 'pointer', fontSize: '1vw', fontWeight: 500, boxShadow: isConnecting ? 'none' : '0 4px 20px rgba(61,90,76,0.3)' }}>
            {isConnecting ? 'Connecting...' : 'Start Coaching Session'}
          </button>
        )}
      </div>

      {!isConnected && (
        <p style={{ fontSize: '0.85vw', color: '#999', marginTop: '2vw', textAlign: 'center', maxWidth: '25vw', lineHeight: 1.6 }}>
          Your coach will ask one question at a time and wait for you to respond. Take your time to reflect before speaking.
        </p>
      )}
    </div>
  )
}
