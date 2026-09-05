import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are Auren, a helpful and encouraging language tutor. The user is practicing English. Analyze their transcribed speech.

Instructions:
1. Check if the user made any grammatical or vocabulary mistakes.
2. If they made a mistake: Point out the mistake kindly, provide the corrected sentence (e.g. "You said 'I just eat the food', but it should be 'I just ate the food'."), and then ask a relevant follow-up question to keep the conversation going.
3. If they did NOT make a mistake: Praise their good grammar or vocabulary (e.g. "Your grammar is perfectly correct!"), and ask a relevant follow-up question.
4. Always act like a human talking to them.
5. Do not use formatting like bolding or lists, just return plain text that is easy for a Text-to-Speech engine to read out loud.`;

async function callOpenRouter(transcript: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free';

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
