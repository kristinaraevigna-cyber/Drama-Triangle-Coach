import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

// Voice options: alloy, echo, fable, onyx, nova, shimmer
// Nova and Shimmer are more feminine, Onyx and Echo are more masculine
const VOICE_MAP: { [key: string]: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' } = {
  default: 'nova',      // Warm, friendly female voice - great for coaching
  male: 'onyx',         // Deep, authoritative male voice
  female: 'nova',       // Warm female voice
  neutral: 'alloy',     // Neutral, balanced voice
  storyteller: 'fable', // Expressive, British accent
  soft: 'shimmer',      // Soft, gentle female voice
}

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'default', speed = 1.0 } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const selectedVoice = VOICE_MAP[voice] || VOICE_MAP.default

    const mp3Response = await openai.audio.speech.create({
      model: 'tts-1-hd',  // High quality model
      voice: selectedVoice,
      input: text,
      speed: speed  // 0.25 to 4.0
    })

    // Get the audio as a buffer
    const audioBuffer = Buffer.from(await mp3Response.arrayBuffer())

    // Return the audio file
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('Speech API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    )
  }
}