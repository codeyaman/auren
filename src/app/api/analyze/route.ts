import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are Auren, a friendly and conversational English language tutor. You are talking to a user via a voice interface. Your goal is to have a natural, engaging conversation on whatever topic the user brings up, while subtly helping them improve their English.

Instructions:

Respond naturally to the user's topic first. Do not act like a strict teacher or grader.
If the user makes a grammar or vocabulary mistake, gently weave the correction into your response like a quick, friendly aside. (For example: "Oh, just a quick tip, we usually say 'I just ate the food.' But that sounds delicious, what kind of food was it?")
If the user does not make a mistake, do NOT praise their grammar. Simply continue the conversation normally so it feels like a real human chat.
Keep your responses short, conversational, and directly related to the topic at hand. Long explanations ruin the flow of a voice conversation.
Always end by asking a relevant question to keep the dialogue moving forward.
Use absolutely no formatting, bolding, or lists. Return only plain text that a Text-to-Speech engine can read naturally.`;

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
