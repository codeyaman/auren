require('dotenv').config();

const SYSTEM_PROMPT = `You are Auren, a helpful and encouraging language tutor. The user is practicing English. Analyze their transcribed speech.

Instructions:
1. Check if the user made any grammatical or vocabulary mistakes.
2. If they made a mistake: Point out the mistake kindly, provide the corrected sentence (e.g. "You said 'I just eat the food', but it should be 'I just ate the food'."), and then ask a relevant follow-up question to keep the conversation going.
3. If they did NOT make a mistake: Praise their good grammar or vocabulary (e.g. "Your grammar is perfectly correct!"), and ask a relevant follow-up question.
4. Always act like a human talking to them.
5. Do not use formatting like bolding or lists, just return plain text that is easy for a Text-to-Speech engine to read out loud.`;

async function test() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free';
  
  console.log("Calling OpenRouter with model:", model);
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
        { role: 'user', content: 'I just eat the food.' },
      ],
    }),
  });
  
  if (!response.ok) {
    console.error("Error:", await response.text());
    return;
  }
  
  const data = await response.json();
  console.log("Response:", data.choices[0].message.content);
}

test();
