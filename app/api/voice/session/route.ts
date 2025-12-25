import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { language, systemPrompt } = await request.json()

    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        voice: 'alloy',
        instructions: systemPrompt,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI error:', error)
      throw new Error('Failed to create realtime session')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Voice session error:', error)
    return NextResponse.json(
      { error: 'Failed to create voice session' },
      { status: 500 }
    )
  }
}
