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
  
  return `You are a Compassion Coach, an ICF-certified professional coach following the 2025 ICF Core Competencies. You specialize in Dr. Stephen Karpman's Drama Triangle and Compassion Triangle frameworks. You are having a VOICE conversation.

## VOICE CONVERSATION STYLE
- Speak naturally and conversationally, as if in person
- Keep responses SHORT (2-4 sentences typically)
- Use warm, empathetic tone
- No bullet points or lists - speak in flowing sentences
- Pause and allow silence when appropriate
- Respond in ${languageName}

## ICF COACHING ARC - FOLLOW THIS STRUCTURE

### 1. OPENING & AGREEMENT (First 2-3 exchanges)
Start by establishing the coaching agreement for THIS session:
- Warmly greet and create safety
- Ask: "What would you like to focus on today?" or "What's on your mind?"
- Then ask: "Why is this important to you RIGHT NOW?"
- Clarify: "What would you like to walk away with from our conversation today?"
- This creates clear focus and measures of success

### 2. EXPLORATION & AWARENESS (Middle of conversation)
Use powerful questions to deepen understanding:
- "Tell me more about that..."
- "What are you noticing as you share this?"
- "What's the impact of this on you?"
- "What patterns do you see here?"
- Listen for Drama Triangle roles (Victim, Persecutor, Rescuer)
- Reflect back what you hear to ensure understanding
- Notice and name emotions and energy shifts
- Help them see what they might not be seeing

### 3. GENERATING POSSIBILITIES
When awareness emerges, explore options:
- "What options do you see?"
- "What else might be possible?"
- "If you weren't feeling stuck, what might you try?"
- Support reframing perspectives
- Guide toward Compassion Triangle alternatives when relevant

### 4. ACTION & ACCOUNTABILITY (Final exchanges)
Partner with client to design concrete next steps:
- "What's one thing you could do differently?"
- "When specifically will you do this?"
- "How will you hold yourself accountable?"
- "What support do you need?"
- Acknowledge their progress and insights

### 5. CLOSING
- Briefly summarize key insights from the session
- Acknowledge their work and growth
- End with encouragement

## 2025 ICF CORE COMPETENCIES TO EMBODY

**Demonstrates Ethical Practice**
- Maintain confidentiality and appropriate boundaries
- You are a COACH, not a therapist - refer out if someone needs clinical support
- If someone mentions self-harm, express care and suggest professional resources

**Embodies a Coaching Mindset**
- Clients are responsible for their own choices
- Remain curious, open, and non-judgmental
- Trust your intuition

**Establishes and Maintains Agreements**
- Always clarify what they want from THIS conversation
- Partner on focus and direction
- Check in: "Is this what you want to explore?"

**Cultivates Trust and Safety**
- Seek to understand their context, identity, values, beliefs
- Show empathy and genuine concern
- Support their expression of feelings without judgment

**Maintains Presence**
- Stay focused and responsive
- Be comfortable with silence and not knowing
- Manage your own responses to stay present

**Listens Actively**
- Listen for what's said AND unsaid
- Reflect back to ensure understanding
- Notice emotions, energy shifts, patterns
- Integrate words, tone, and meaning

**Evokes Awareness**
- Ask powerful questions that help them think beyond current patterns
- Challenge gently to evoke insight
- Share observations without attachment
- Help identify factors influencing their patterns
- Support reframing perspectives

**Facilitates Client Growth**
- Partner to design goals and actions THEY create
- Support client autonomy - never tell them what to do
- Acknowledge their progress and successes
- Help them integrate new awareness into action

## DRAMA TRIANGLE AWARENESS

When you notice Drama Triangle patterns, gently bring awareness:

**VICTIM patterns** ("Poor me", helpless, "I can't"):
- Help them move to VULNERABLE: Owning feelings while staying capable
- Ask: "What part of this IS within your control?"

**PERSECUTOR patterns** (Blaming, criticizing, attacking):
- Help them move to ASSERTIVE: Setting boundaries with respect
- Ask: "What do YOU need here? How could you express that directly?"

**RESCUER patterns** (Over-helping, fixing, enabling):
- Help them move to CARING: Supporting without creating dependency
- Ask: "What would it look like to support them without taking over?"

## WHAT NOT TO DO
- Never give advice or tell them what to do
- Don't fix their problems for them
- Don't analyze them like a therapist
- Don't lecture or teach (that's for Mentor Coach)
- Don't skip the opening agreement
- Don't end without exploring action
- Don't fill silences unnecessarily

Remember: Be natural, warm, present, and genuinely curious. Partner WITH them - their wisdom is inside them. Your job is to help them access it.`
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
      en: "Hello, I'm your Compassion Coach. I'm here to support you today. What would you like to focus on in our conversation?",
      es: "Hola, soy tu Coach de Compasión. Estoy aquí para apoyarte. ¿En qué te gustaría enfocarte en nuestra conversación?",
      fr: "Bonjour, je suis votre Coach de Compassion. Je suis là pour vous accompagner. Sur quoi aimeriez-vous vous concentrer aujourd'hui?",
      de: "Hallo, ich bin Ihr Mitgefühls-Coach. Worauf möchten Sie sich heute konzentrieren?",
      it: "Ciao, sono il tuo Coach della Compassione. Su cosa vorresti concentrarti oggi?",
      pt: "Olá, sou seu Coach de Compaixão. No que você gostaria de se concentrar hoje?",
      ja: "こんにちは、私はあなたのコンパッションコーチです。今日は何に焦点を当てたいですか？",
      ko: "안녕하세요, 저는 당신의 컴패션 코치입니다. 오늘 무엇에 집중하고 싶으신가요?",
      zh: "你好，我是你的慈悲教练。今天你想关注什么？",
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
              threshold: 0.7,              // Increased from 0.5 - requires louder speech to trigger
              prefix_padding_ms: 500,      // Increased from 300 - more buffer before speech
              silence_duration_ms: 1200,   // Increased from 700 - waits longer before responding
            },
          },
        }))
        
        setTimeout(() => {
          const greeting = getGreeting(selectedLanguage)
          messagesRef.current.push({ role: 'assistant', content: greeting })
          dataChannel.current?.send(JSON.stringify({
            type: 'response.create',
            response: { modalities: ['text', 'audio'], instructions: `Say naturally: "${greeting}"` },
          }))
        }, 500)
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
      setStatus('Connected - Speak naturally')
      
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

        if (user && summaryData.actions?.length > 0) {
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

  // Sound Bars Component
  const SoundBars = ({ isActive, color }: { isActive: boolean; color: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3vw', height: '3vw' }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            width: '0.4vw',
            height: isActive ? '1.5vw' : '0.8vw',
            backgroundColor: color,
            borderRadius: '0.2vw',
            animation: isActive ? `soundBar 0.5s ease-in-out infinite ${i * 0.1}s` : 'none',
          }}
        />
      ))}
      <style>{`
        @keyframes soundBar {
          0%, 100% { height: 0.8vw; }
          50% { height: 2.5vw; }
        }
      `}</style>
    </div>
  )

  // Session Summary View
  if (showSummary && sessionSummary) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '2vw', backgroundColor: '#FAFAF8', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '1.5vw', fontWeight: 500, color: '#1a1a1a', marginBottom: '1vw', fontFamily: 'Georgia, serif' }}>Session Complete ✓</h2>
        
        <div style={{ backgroundColor: '#fff', borderRadius: '0.8vw', padding: '1.5vw', marginBottom: '1vw', border: '1px solid #e8e8e8' }}>
          <h3 style={{ fontSize: '1vw', color: '#3D5A4C', marginBottom: '0.5vw', fontWeight: 500 }}>Summary</h3>
          <p style={{ fontSize: '0.95vw', color: '#333', margin: 0, lineHeight: 1.6 }}>{sessionSummary.summary}</p>
        </div>

        {sessionSummary.keyInsights?.length > 0 && (
          <div style={{ backgroundColor: '#F0F7F4', borderRadius: '0.8vw', padding: '1.5vw', marginBottom: '1vw' }}>
            <h3 style={{ fontSize: '1vw', color: '#3D5A4C', marginBottom: '0.8vw', fontWeight: 500 }}>Key Insights</h3>
            {sessionSummary.keyInsights.map((insight, i) => (
              <p key={i} style={{ fontSize: '0.9vw', color: '#333', margin: '0 0 0.5vw 0', paddingLeft: '1vw', borderLeft: '2px solid #3D5A4C', lineHeight: 1.5 }}>{insight}</p>
            ))}
          </div>
        )}

        {sessionSummary.dramaPatterns?.length > 0 && (
          <div style={{ backgroundColor: '#FFF8F0', borderRadius: '0.8vw', padding: '1.5vw', marginBottom: '1vw' }}>
            <h3 style={{ fontSize: '1vw', color: '#8B4513', marginBottom: '0.8vw', fontWeight: 500 }}>Drama Triangle Patterns Noticed</h3>
            {sessionSummary.dramaPatterns.map((pattern, i) => (
              <p key={i} style={{ fontSize: '0.9vw', color: '#333', margin: '0 0 0.5vw 0', lineHeight: 1.5 }}>• {pattern}</p>
            ))}
          </div>
        )}

        {sessionSummary.compassionShift && (
          <div style={{ backgroundColor: '#F5F5FF', borderRadius: '0.8vw', padding: '1.5vw', marginBottom: '1vw' }}>
            <h3 style={{ fontSize: '1vw', color: '#4B0082', marginBottom: '0.5vw', fontWeight: 500 }}>Movement Toward Compassion</h3>
            <p style={{ fontSize: '0.9vw', color: '#333', margin: 0, lineHeight: 1.6 }}>{sessionSummary.compassionShift}</p>
          </div>
        )}

        {sessionSummary.actions?.length > 0 && (
          <div style={{ backgroundColor: '#fff', borderRadius: '0.8vw', padding: '1.5vw', marginBottom: '1vw', border: '2px solid #3D5A4C' }}>
            <h3 style={{ fontSize: '1vw', color: '#3D5A4C', marginBottom: '1vw', fontWeight: 500 }}>✓ Committed Actions</h3>
            {sessionSummary.actions.map((action, i) => (
              <div key={i} style={{ padding: '1vw', backgroundColor: '#F0F7F4', borderRadius: '0.5vw', marginBottom: '0.5vw' }}>
                <p style={{ fontSize: '0.95vw', color: '#1a1a1a', margin: 0, fontWeight: 500, lineHeight: 1.5 }}>{action.action}</p>
                <p style={{ fontSize: '0.8vw', color: '#666', margin: '0.3vw 0 0 0' }}>📅 {action.timeline} • ✓ {action.accountability}</p>
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

  // Generating Summary View
  if (isGeneratingSummary) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#FAFAF8' }}>
        <div style={{ width: '8vw', height: '8vw', borderRadius: '50%', backgroundColor: '#F0F7F4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5vw' }}>
          <SoundBars isActive={true} color="#3D5A4C" />
        </div>
        <p style={{ fontSize: '1.2vw', color: '#3D5A4C', fontWeight: 500 }}>Generating session summary...</p>
        <p style={{ fontSize: '0.9vw', color: '#666' }}>Extracting insights and actions</p>
      </div>
    )
  }

  // Main Voice Chat View
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '3vw', backgroundColor: '#FAFAF8' }}>
      {/* Visual Indicator - Sound Bars */}
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

      {/* Status */}
      <p style={{ fontSize: '1.2vw', color: isConnected ? '#3D5A4C' : '#666', marginBottom: '0.5vw', fontWeight: 500 }}>{status}</p>
      
      {isConnected && (
        <p style={{ fontSize: '0.9vw', color: '#999', marginBottom: '1.5vw' }}>
          {isAISpeaking ? 'Listen to your coach...' : 'Speak naturally - I\'m listening'}
        </p>
      )}

      {/* Language Selector (when not connected) */}
      {!isConnected && (
        <div style={{ position: 'relative', marginBottom: '1.5vw' }}>
          <button onClick={() => setShowLanguages(!showLanguages)} style={{ display: 'flex', alignItems: 'center', gap: '0.6vw', padding: '0.6vw 1.2vw', backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '0.5vw', cursor: 'pointer', fontSize: '0.9vw' }}>
            🌐 {LANGUAGES.find(l => l.code === selectedLanguage)?.flag} {LANGUAGES.find(l => l.code === selectedLanguage)?.name}
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

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
        {isConnected ? (
          <>
            <button onClick={toggleMute} style={{ width: '3.5vw', height: '3.5vw', borderRadius: '50%', border: 'none', cursor: 'pointer', backgroundColor: isMuted ? 'rgba(168,84,84,0.15)' : '#f0f0f0', fontSize: '1.3vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted ? '🔇' : '🎤'}
            </button>
            <button onClick={disconnectSession} style={{ padding: '0.8vw 1.5vw', borderRadius: '2vw', border: 'none', cursor: 'pointer', backgroundColor: '#A85454', color: '#fff', fontSize: '0.95vw', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5vw', boxShadow: '0 4px 15px rgba(168,84,84,0.3)', fontWeight: 500 }}>
              ⏹ End Session
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

      {/* Instructions (when not connected) */}
      {!isConnected && (
        <p style={{ fontSize: '0.85vw', color: '#999', marginTop: '2vw', textAlign: 'center', maxWidth: '25vw', lineHeight: 1.6 }}>
          Your coach will guide you through the ICF coaching arc: exploring what matters, gaining awareness, and designing your next step.
        </p>
      )}
    </div>
  )
}
