<div align="center">
  <h1>Auren Voice Tutor</h1>
  <p><strong>A hyper-premium, real-time English language coaching experience.</strong></p>
</div>

<br />

<div align="center">
  <p>
    Auren is a next-generation language tutor built for those who appreciate design restraint and technical excellence. With a quiet, luxurious interface inspired by the best modern developer tools, Auren offers an unparalleled conversational experience. Speak naturally, receive instant, grammatically precise feedback, and engage in a seamless, continuous dialogue with advanced AI.
  </p>
</div>

<br />

## ✦ The Experience

Most language learning apps feel like toys. Auren feels like a professional tool. 
Built with a "quiet luxury" aesthetic—deep, warm dark tones, hairline borders, and fluid, snapping motion—Auren is designed to get out of your way and let you focus on mastering your language skills.

- **Seamless Turn-Taking:** No pressing "send", no awkward manual intervention. You speak, Auren listens. Auren speaks, and the moment it finishes, the microphone gracefully re-awakens for you. 
- **Intelligent Correction:** Auren actively hunts for grammatical and vocabulary mistakes. If you slip up, it gently corrects you, provides the right phrasing, and moves the conversation forward seamlessly.
- **Flawless Motion:** Every interaction is meticulously choreographed. From the subtle mesh gradients to the pulse of the recording indicator, Auren's UI relies on precision easings and a hyper-responsive frontend.
- **Premium Typography & UI:** Utilizing Inter and mono fonts with 1px hairline borders, the visual design is understated yet undeniably rich.

## ✦ Architecture

Under the hood, Auren is a modern, high-performance Web App utilizing the cutting-edge capabilities of AI and browser APIs:

- **Frontend:** Built on **Next.js** and **React**, styled with Vanilla CSS and Tailwind-inspired utility classes (but keeping things exceptionally clean).
- **Motion:** Driven by **Framer Motion**, utilizing custom linear-quint easing curves (`[0.22, 1, 0.36, 1]`) for snappy, non-elastic transitions.
- **Speech Recognition:** Integrates natively with the Web Speech API for instantaneous, continuous interim transcripts.
- **Intelligence:** Powered by **OpenRouter** (Nemotron 120b) with a seamless fallback to **Google Gemini 2.5 Flash**, ensuring the conversational engine is never down.
- **Voice Synthesis:** Native browser TTS engines integrated directly into the React lifecycle to create an interrupt-free conversational loop.

## ✦ Getting Started

Experience the richness of Auren locally.

```bash
# 1. Clone the repository
git clone https://github.com/codeyaman/auren.git

# 2. Install dependencies
cd auren
npm install

# 3. Configure the environment
# Create a .env file and add your keys:
# OPENROUTER_API_KEY=your_key
# GEMINI_API_KEY=your_key

# 4. Start the coaching engine
npm run dev
```

Open `http://localhost:3000`, grant microphone permissions, and hit <kbd>CMD</kbd> <kbd>K</kbd> (or tap the microphone) to begin your practice.

## ✦ Design Philosophy

We believe software should feel expensive. Auren rejects emojis, bouncy springs, and overly saturated colors. Instead, it embraces:
- **Restraint as confidence**: Minimal UI elements, allowing the conversation to take center stage.
- **Selective accenting**: A single, precise purple accent (`#5E6AD2`) used only where focus is demanded.
- **Architectural spacing**: Strict adherence to a 4-point grid system.

## ✦ License

Built with 🖤 by Codeyaman. Open-sourced under the MIT License.
