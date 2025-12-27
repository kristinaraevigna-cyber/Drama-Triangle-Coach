import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { messages, userId } = await request.json()

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    const conversationText = messages
      .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'Client' : 'Coach'}: ${m.content}`)
      .join('\n\n')

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert at summarizing ICF coaching sessions focused on the Drama Triangle and Compassion Triangle frameworks.

Analyze the coaching conversation and provide:
1. SESSION SUMMARY (2-3 sentences)
2. KEY INSIGHTS (bullet points)
3. DRAMA TRIANGLE PATTERNS observed
4. COMPASSION SHIFT discussed
5. COMMITTED ACTIONS with timeline and accountability

Return valid JSON:
{
  "summary": "Brief summary",
  "keyInsights": ["insight 1", "insight 2"],
  "dramaPatterns": ["pattern"],
  "compassionShift": "Description",
  "actions": [{"action": "text", "timeline": "when", "accountability": "how"}],
  "sessionTopic": "Short topic title"
}`
        },
        {
          role: 'user',
          content: `Analyze this coaching session:\n\n${conversationText}`
        }
      ],
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content || '{}'
    
    let sessionData
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim()
      sessionData = JSON.parse(cleanContent)
    } catch {
      sessionData = {
        summary: 'Session completed',
        keyInsights: [],
        dramaPatterns: [],
        compassionShift: '',
        actions: [],
        sessionTopic: 'Coaching Session'
      }
    }

    return NextResponse.json({ success: true, ...sessionData, userId })

  } catch (error) {
    console.error('Session summary error:', error)
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 })
  }
}
```

---

## Step 2: Your folder structure should now look like:
```
app/
  api/
    chat/
    mentor/
    transcribe/
    voice/
      session/
        route.ts
    session/          ← NEW
      summary/        ← NEW
        route.ts      ← NEW
