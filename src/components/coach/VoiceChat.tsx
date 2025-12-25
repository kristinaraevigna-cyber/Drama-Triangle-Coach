'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

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
    setStatus('Session ended')
  }, [])

  const toggleMute = () => {
    if (mediaStream.current) {
      const audioTrack = mediaStream.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = isMuted
        setIsMuted(!isMuted)
        setStatus(isMuted ? 'Microphone on' : 'Microphone muted')
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
      padding: '3vw',
      backgroundColor: '#FAFAF8'
    }}>
      {/* Visual feedback circle */}
      <div style={{ position: 'relative', marginBottom: '2.5vw' }}>
        <div style={{
          width: '14vw',
          height: '14vw',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          backgroundColor: isConnected 
            ? isAISpeaking 
              ? '#4B0082'
              : '#3D5A4C'
            : '#e8e8e8',
          boxShadow: isConnected
            ? isAISpeaking 
              ? '0 0 60px rgba(75, 0, 130, 0.5), 0 0 100px rgba(75, 0, 130, 0.3)'
              : '0 0 40px rgba(61, 90, 76, 0.3)'
            : 'none'
        }}>
          <span style={{ fontSize: '4vw' }}>
            {isConnected 
              ? isAISpeaking ? '🗣️' : '👂'
              : '🎙️'
            }
          </span>
        </div>
        
        {/* Pulsing rings when AI is speaking */}
        {isAISpeaking && (
          <>
            <div style={{
              position: 'absolute',
              inset: '-10px',
              borderRadius: '50%',
              border: '2px solid rgba(75, 0, 130, 0.4)',
              animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
            }} />
            <div style={{
              position: 'absolute',
              inset: '-20px',
              borderRadius: '50%',
              border: '1px solid rgba(75, 0, 130, 0.2)',
              animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
              animationDelay: '0.3s'
            }} />
          </>
        )}

        {/* Listening indicator */}
        {isConnected && !isAISpeaking && (
          <div style={{
            position: 'absolute',
            inset: '-5px',
            borderRadius: '50%',
            border: '3px solid rgba(61, 90, 76, 0.5)',
            animation: 'pulse 2s ease-in-out infinite'
          }} />
        )}
      </div>

      {/* Status */}
      <p style={{
        fontSize: '1.3vw',
        color: isConnected ? '#3D5A4C' : '#666',
        marginBottom: '1vw',
        textAlign: 'center',
        fontWeight: 500
      }}>
        {status}
      </p>

      {/* Instruction text */}
      {isConnected && (
        <p style={{
          fontSize: '0.95vw',
          color: '#999',
          marginBottom: '2vw',
          textAlign: 'center'
        }}>
          {isAISpeaking 
            ? 'Listen to your coach...' 
            : 'Speak naturally - I\'m listening'}
        </p>
      )}

      {/* Language selector (only when disconnected) */}
      {!isConnected && (
        <div style={{ position: 'relative', marginBottom: '2vw' }}>
          <button
            onClick={() => setShowLanguages(!showLanguages)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.8vw',
              padding: '0.8vw 1.5vw',
              backgroundColor: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '0.5vw',
              cursor: 'pointer',
              fontSize: '1vw'
            }}
          >
            <span style={{ fontSize: '1.2vw' }}>🌐</span>
            <span>{LANGUAGES.find(l => l.code === selectedLanguage)?.flag}</span>
            <span>{LANGUAGES.find(l => l.code === selectedLanguage)?.name}</span>
            <span style={{ fontSize: '0.8vw', color: '#999' }}>▼</span>
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
              minWidth: '14vw',
              maxHeight: '25vw',
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
                    padding: '0.7vw 1vw',
                    borderRadius: '0.3vw',
                    border: 'none',
                    backgroundColor: selectedLanguage === lang.code ? '#F0F7F4' : 'transparent',
                    color: selectedLanguage === lang.code ? '#3D5A4C' : '#333',
                    cursor: 'pointer',
                    fontSize: '0.95vw',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8vw'
                  }}
                >
                  <span style={{ fontSize: '1.2vw' }}>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5vw' }}>
        {isConnected ? (
          <>
            {/* Mute button */}
            <button
              onClick={toggleMute}
              style={{
                width: '4vw',
                height: '4vw',
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isMuted ? 'rgba(168, 84, 84, 0.15)' : '#f0f0f0',
                color: isMuted ? '#A85454' : '#666',
                fontSize: '1.5vw',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? '🔇' : '🎤'}
            </button>

            {/* End call button */}
            <button
              onClick={disconnectSession}
              style={{
                width: '5vw',
                height: '5vw',
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: '#A85454',
                color: '#ffffff',
                fontSize: '1.8vw',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(168, 84, 84, 0.4)',
                transition: 'all 0.2s'
              }}
              title="End session"
            >
              📵
            </button>

            {/* Speaker button */}
            <button
              onClick={toggleSpeaker}
              style={{
                width: '4vw',
                height: '4vw',
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: !isSpeakerOn ? 'rgba(168, 84, 84, 0.15)' : '#f0f0f0',
                color: !isSpeakerOn ? '#A85454' : '#666',
                fontSize: '1.5vw',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
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
              gap: '1vw',
              padding: '1.3vw 3vw',
              backgroundColor: isConnecting ? '#ccc' : '#3D5A4C',
              color: '#ffffff',
              border: 'none',
              borderRadius: '3vw',
              cursor: isConnecting ? 'not-allowed' : 'pointer',
              fontSize: '1.15vw',
              fontWeight: 500,
              boxShadow: isConnecting ? 'none' : '0 4px 20px rgba(61, 90, 76, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            {isConnecting ? (
              <>
                <span style={{ 
                  display: 'inline-block',
                  animation: 'spin 1s linear infinite' 
                }}>⏳</span>
                Connecting...
              </>
            ) : (
              <>
                <span style={{ fontSize: '1.3vw' }}>📞</span>
                Start Voice Session
              </>
            )}
          </button>
        )}
      </div>

      {/* Instructions */}
      {!isConnected && (
        <p style={{
          fontSize: '0.95vw',
          color: '#999',
          marginTop: '2.5vw',
          textAlign: 'center',
          maxWidth: '28vw',
          lineHeight: 1.6
        }}>
          Click to start a voice conversation with your coach. 
          Speak naturally in your preferred language - no typing needed.
        </p>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.02); opacity: 0.4; }
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
