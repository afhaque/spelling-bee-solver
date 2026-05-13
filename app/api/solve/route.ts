import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { letters, requiredLetter } = body as { letters: string[]; requiredLetter: string }

    if (!letters || letters.length !== 7) {
      return NextResponse.json({ error: 'Exactly 7 letters required' }, { status: 400 })
    }
    if (!requiredLetter || !letters.includes(requiredLetter.toUpperCase())) {
      return NextResponse.json({ error: 'Required letter must be one of the 7 letters' }, { status: 400 })
    }

    const letterSet = letters.map((l) => l.toUpperCase())
    const center = requiredLetter.toUpperCase()

    const prompt = `You are a Spelling Bee word finder. Given a set of 7 letters and a required center letter, find all valid English words following these rules:

RULES:
1. Each word must be at least 4 letters long
2. Each word MUST contain the required center letter at least once
3. Each word may only use letters from the provided set
4. Letters can be reused in a word as many times as needed (they are not consumed)
5. No proper nouns, hyphenated words, or obscure words — common English dictionary words only

LETTER SET: ${letterSet.join(', ')}
REQUIRED CENTER LETTER: ${center}

Return ONLY a JSON array of valid words, sorted from shortest to longest, then alphabetically within same length. No explanation, no markdown — just the raw JSON array.

Example output format: ["able","bale","cable","blade"]`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    // Parse the JSON array from Claude's response
    const text = content.text.trim()
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return NextResponse.json({ words: [] })
    }

    const words: string[] = JSON.parse(jsonMatch[0])

    // Server-side validation: filter any words that don't meet rules
    const validWords = words.filter((word) => {
      const w = word.toUpperCase()
      if (w.length < 4) return false
      if (!w.includes(center)) return false
      for (const char of w) {
        if (!letterSet.includes(char)) return false
      }
      return true
    })

    return NextResponse.json({ words: validWords })
  } catch (error) {
    console.error('Solve API error:', error)
    return NextResponse.json({ error: 'Failed to generate words' }, { status: 500 })
  }
}
