'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
]

const getSystemPrompt = (languageCode: string) => {
  const languageName = LANGUAGES.find(l => l.code === languageCode)?.name || 'English'
  
  return `You are a Compassion Coach, trained in ICF (International Coaching Federation) methodology and Dr. Stephen Karpman's Drama Triangle framework. You are having a VOICE conversation, so keep responses conversational, warm, and concise.

## VOICE CONVERSATION GUIDELINES
- Speak naturally as if in person - use conversational language
- Keep responses SHORT (2-4 sentences typically)
- Don't use bullet points, lists, or formatting - speak in flowing sentences
- Be warm but professional
- The person is speaking to you in ${languageName} - respond in the same language

## ICF COACHING APPROACH
You are a COACH, not a therapist or advisor. Your role is to:
- Trust that the client is naturally creative, resourceful, and whole
- Ask powerful, open-ended questions that evoke discovery
- Listen deeply for what matters most to them
- Support them in designing their own solutions
- Never give advice or tell them what to do

## DRAMA TRIANGLE AWARENESS
Help clients recognize when they're in Drama Triangle roles:
- VICTIM: "Poor me" - feeling helpless, powerless
- PERSECUTOR: "It's your fault" - blaming, criticizing
- RESCUER: "Let me help" - enabling, over-functioning

Guide them toward Compassion Triangle alternatives:
- VULNERABLE: Owning feelings while maintaining capability
- ASSERTIVE: Setting boundaries with respect
- CARING: Supporting without creating dependency

## CONVERSATION FLOW
1. CONNECT - Warm greeting, be present
2. EXPLORE - "What's on your mind today?"
3. DEEPEN - Ask curious questions about feelings and patterns
4. AWARENESS - Help them see Drama Triangle patterns
5. POSSIBILITIES - "What options do you see?"
6. COMPASSION - Guide toward Compassion Triangle alternatives
7. ACTION - "What's one small step you could take?"

## IMPORTANT SAFETY NOTE
If someone expresses thoughts of self-harm or harming others:
1. Express genuine care and concern
2. Gently encourage them to speak with a mental health professional
3. Provide crisis resources if appropriate

Remember: You're having a voice conversation. Be natural, warm, and present. Respond in ${languageName}.`
}

interface VoiceChatProps {
  onTranscript?: (text: string, role: 'user' | 'assistant') => void
}

export function VoiceChat({ onTranscript }: VoiceChatProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [status, setStatus] = useState<string>('Ready to connect')
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [showLanguages, setShowLanguages] = useState(false)
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const peerConnection = useRef<RTCPeerConnection | null>(null)
  const dataChannel = useRef<RTCDataChannel | null>(null)
  const audioElement = useRef<HTMLAudioElement | null>(null)
  const mediaStream = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      disconnectSession()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const connectSession = async () => {
    setIsConnecting(true)
    setStatus('Requesting microphone access...')

    try {
      mediaStream.current = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 24000,
        } 
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

      if (!tokenResponse.ok) {
        throw new Error('Failed to get session token')
      }

      const { client_secret } = await tokenResponse.json()

      peerConnection.current = new RTCPeerConnection()

      audioElement.current = new Audio()
      audioElement.current.autoplay = true

      peerConnection.current.ontrack = (event) => {
        if (audioElement.current) {
          audioElement.current.srcObject = event.streams[0]
        }
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
            turn_detection: { 
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
            },
          },
        }
        dataChannel.current?.send(JSON.stringify(sessionUpdate))
        
        setTimeout(() => {
          const greeting = getGreeting(selectedLanguage)
          
          const responseCreate = {
            type: 'response.create',
            response: {
              modalities: ['text', 'audio'],
              instructions: `Say this greeting naturally: "${greeting}"`,
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

      if (!sdpResponse.ok) {
        throw new Error('Failed to connect to voice service')
      }

      const answerSdp = await sdpResponse.text()
      await peerConnection.current.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      })

      setIsConnected(true)
      setStatus('Connected - Speak naturally')
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Connection error:', error)
      setStatus(`Error: ${errorMessage}`)
      disconnectSession()
    } finally {
      setIsConnecting(false)
    }
  }

  const getGreeting = (lang: string): string => {
    const greetings: Record<string, string> = {
      en: "Hello! I'm your Compassion Coach. I'm here to support you today. What's on your mind?",
      es: "¡Hola! Soy tu Coach de Compasión. Estoy aquí para apoyarte hoy. ¿Qué tienes en mente?",
      fr: "Bonjour! Je suis votre Coach de Compassion. Je suis là pour vous accompagner aujourd'hui. Qu'avez-vous en tête?",
      de: "Hallo! Ich bin Ihr Mitgefühls-Coach. Ich bin heute hier, um Sie zu unterstützen. Was beschäftigt Sie?",
      it: "Ciao! Sono il tuo Coach della Compassione. Sono qui per supportarti oggi. Cosa hai in mente?",
      pt: "Olá! Sou seu Coach de Compaixão. Estou aqui para apoiá-lo hoje. O que está em sua mente?",
      nl: "Hallo! Ik ben je Compassie Coach. Ik ben hier om je vandaag te ondersteunen. Wat houdt je bezig?",
      pl: "Cześć! Jestem Twoim Coachem Współczucia. Jestem tu, aby Cię dziś wesprzeć. Co masz na myśli?",
      ru: "Здравствуйте! Я ваш Коуч Сострадания. Я здесь, чтобы поддержать вас сегодня. Что у вас на уме?",
      ja: "こんにちは！私はあなたのコンパッションコーチです。今日はあなたをサポートするためにここにいます。何を考えていますか？",
      ko: "안녕하세요! 저는 당신의 컴패션 코치입니다. 오늘 당신을 지원하기 위해 여기 있습니다. 무슨 생각을 하고 계세요?",
      zh: "你好！我是你的慈悲教练。我今天在这里支持你。你在想什么？",
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
        if (event.transcript && onTranscript) {
          onTranscript(event.transcript, 'user')
        }
        break
        
      case 'response.audio_transcript.done':
        if (event.transcript && onTranscript) {
          onTranscript(event.transcript, 'assistant')
        }
        break
        
      case 'error':
        console.error('Realtime error:', event.error)
        setStatus(`Error: ${event.error?.message || 'Unknown error'}`)
        break
    }
  }

  const disconnectSession = useCallback(() => {
    if (dataChannel.current) {
      dataChannel.current.close()
      dataChannel.current = null
    }

    if (peerConnection.current) {
      peerConnection.current.close()
      peerConnection.current = null
    }

    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach(track => track.stop())
      mediaStream.current = null
    }

    if (audioElement.current) {
      audioElement.current.srcObject = null
      audioElement.current = null
    }

    setIsConnected(false)
    setIsAISpeaking(false)
    setStatus('Disconnected')
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

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '2vw'
    }}>
      {/* Visual feedback circle */}
      <div style={{
        position: 'relative',
        marginBottom: '2vw'
      }}>
        <div style={{
          width: '12vw',
          height: '12vw',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s',
          backgroundColor: isConnected 
            ? isAISpeaking 
              ? 'rgba(75, 0, 130, 0.3)' 
              : 'rgba(61, 90, 76, 0.2)'
            : '#e8e8e8',
          boxShadow: isAISpeaking ? '0 0 40px rgba(75, 0, 130, 0.4)' : 'none',
          animation: isAISpeaking ? 'pulse 1.5s infinite' : 'none'
        }}>
          <span style={{ fontSize: '3vw' }}>
            {isConnected 
              ? isAISpeaking ? '🗣️' : '👂'
              : '🎙️'
            }
          </span>
        </div>
        
        {isAISpeaking && (
          <div style={{
            position: 'absolute',
            inset: '-8px',
            borderRadius: '50%',
            border: '2px solid rgba(75, 0, 130, 0.3)',
            animation: 'ping 1.5s infinite'
          }} />
        )}
      </div>

      {/* Status */}
      <p style={{
        fontSize: '1.1vw',
        color: '#666',
        marginBottom: '1.5vw',
        textAlign: 'center'
      }}>
        {status}
      </p>

      {/* Language selector (only when disconnected) */}
      {!isConnected && (
        <div style={{ position: 'relative', marginBottom: '2vw' }}>
          <button
            onClick={() => setShowLanguages(!showLanguages)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5vw',
              padding: '0.8vw 1.5vw',
              backgroundColor: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '0.5vw',
              cursor: 'pointer',
              fontSize: '0.95vw'
            }}
          >
            <span>🌐</span>
            <span>{LANGUAGES.find(l => l.code === selectedLanguage)?.flag}</span>
            <span>{LANGUAGES.find(l => l.code === selectedLanguage)?.name}</span>
          </button>
          
          {showLanguages && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              marginBottom: '0.5vw',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '0.5vw',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              padding: '0.5vw',
              minWidth: '12vw',
              maxHeight: '20vw',
              overflowY: 'auto',
              zIndex: 50
            }}>
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLanguage(lang.code)
                    setShowLanguages(false)
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.6vw 1vw',
                    borderRadius: '0.3vw',
                    border: 'none',
                    backgroundColor: selectedLanguage === lang.code ? '#F0F7F4' : 'transparent',
                    color: selectedLanguage === lang.code ? '#3D5A4C' : '#333',
                    cursor: 'pointer',
                    fontSize: '0.9vw',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5vw'
                  }}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
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
            {/* Mute button */}
            <button
              onClick={toggleMute}
              style={{
                padding: '1vw',
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isMuted ? 'rgba(168, 84, 84, 0.2)' : '#f0f0f0',
                color: isMuted ? '#A85454' : '#666',
                fontSize: '1.5vw'
              }}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? '🔇' : '🎤'}
            </button>

            {/* End call button */}
            <button
              onClick={disconnectSession}
              style={{
                padding: '1.2vw',
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: '#A85454',
                color: '#ffffff',
                fontSize: '1.5vw'
              }}
              title="End session"
            >
              📞
            </button>

            {/* Speaker button */}
            <button
              onClick={toggleSpeaker}
              style={{
                padding: '1vw',
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: !isSpeakerOn ? 'rgba(168, 84, 84, 0.2)' : '#f0f0f0',
                color: !isSpeakerOn ? '#A85454' : '#666',
                fontSize: '1.5vw'
              }}
              title={isSpeakerOn ? 'Mute speaker' : 'Unmute speaker'}
            >
              {isSpeakerOn ? '🔊' : '🔈'}
            </button>
          </>
        ) : (
          <button
            onClick={connectSession}
            disabled={isConnecting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.8vw',
              padding: '1.2vw 2.5vw',
              backgroundColor: isConnecting ? '#ccc' : '#3D5A4C',
              color: '#ffffff',
              border: 'none',
              borderRadius: '3vw',
              cursor: isConnecting ? 'not-allowed' : 'pointer',
              fontSize: '1.1vw',
              fontWeight: 500
            }}
          >
            {isConnecting ? (
              <>
                <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                Connecting...
              </>
            ) : (
              <>
                <span>📞</span>
                Start Voice Session
              </>
            )}
          </button>
        )}
      </div>

      {/* Instructions */}
      {!isConnected && (
        <p style={{
          fontSize: '0.9vw',
          color: '#999',
          marginTop: '2vw',
          textAlign: 'center',
          maxWidth: '25vw'
        }}>
          Click to start a voice conversation with your coach. Speak naturally in your preferred language.
        </p>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
