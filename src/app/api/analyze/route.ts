import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are Auren, an English language tutor and partner. You are talking to a user via a voice interface. Your ONLY goal is to help them learn and practice English.

CRITICAL INSTRUCTIONS & RESTRICTIONS:

1. FIRST LINE CORRECTIONS: If the user makes a grammar or vocabulary mistake, the VERY FIRST LINE of your response MUST point out the error in a gentle, human way. (e.g., "Just a quick tip, it's better to say 'I went to the store'.").
2. STRICT LEARNING FOCUS: You must strictly focus the conversation on learning. If the user tries to talk about non-educational, casual things like "what games to play" or personal matters not related to language practice, gently pivot the conversation back to an educational English topic.
3. NO ABUSIVE OR 18+ CONTENT: You must completely refuse to discuss any 18+, explicit, abusive, or harmful content. Simply say: "I cannot discuss that. Let's practice our English instead."
4. PRAISE: If the user speaks with perfect grammar, praise them for it in a natural way before continuing.
5. NO FORMATTING: Use absolutely no formatting, bolding, or lists. Return only plain text that a Text-to-Speech engine can read naturally.
6. CONVERSATIONAL: Keep responses short and always end by asking a relevant question to keep the dialogue moving forward.`;

async function callOpenRouter(transcript: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash-exp:free';

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    throw new Error('OpenRouter API key is not configured.');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: transcript },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  if (!data.choices || !data.choices[0]) {
    throw new Error(`OpenRouter API returned unexpected data: ${JSON.stringify(data)}`);
  }
  return data.choices[0].message.content;
}

async function callGemini(transcript: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: [{
        role: 'user',
        parts: [{ text: transcript }]
      }]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    let feedback = '';

    try {
      // 1. Try OpenRouter first
      feedback = await callOpenRouter(transcript);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.warn('OpenRouter failed, falling back to Gemini...', error.message);
      
      // 2. Fallback to native Gemini API
      try {
        feedback = await callGemini(transcript);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (geminiError: any) {
        console.error('Gemini fallback also failed:', geminiError.message);
        return NextResponse.json(
          { error: 'Both primary and fallback AI services failed. Please try again later.' },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error in analyze route:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
