# ChatMinds — Multi‑AI Chat Studio

<p align="center">
  <img src="public/chat-bot.png" alt="ChatMinds Logo" width="80" />
</p>

<p align="center">
  <strong>A unified, responsive chat interface for multiple AI providers</strong>
</p>

ChatMinds is a modern React + Vite chat application that brings together multiple AI providers (OpenAI, Google Gemini, Anthropic Claude, xAI Grok, DeepSeek, Groq, and LM Studio) into a single, beautiful interface. Perfect for experiments, local demos, and everyday AI conversations.

---

## ✨ Features

### 🤖 Multi-AI Provider Support
- **OpenAI** (GPT-4o, GPT-4o-mini)
- **Google Gemini** (Gemini 2.0 Flash, Gemini 1.5 Pro/Flash)
- **Anthropic Claude** (Claude 3.5 Sonnet, Claude 3 Opus/Haiku)
- **xAI Grok** (Grok-2, Grok-3)
- **DeepSeek** (DeepSeek Chat via OpenRouter)
- **Groq** (Llama, Mixtral models)
- **LM Studio** (Local models - connect to your local LM Studio server)

### 💬 Chat Features
- **Streaming Responses** — Real-time token-by-token response rendering
- **Multi-Chat Sessions** — Create, switch, and manage multiple conversations
- **Auto-Titled Chats** — Conversations auto-titled from first message
- **Persistent History** — All chats saved to localStorage
- **Global System Instruction** — Set AI personality/behavior across all chats
- **Markdown Rendering** — Beautiful formatting for AI responses
- **Copy Button** — One-click copy for any message

### 🎨 Modern UI/UX
- **Responsive Design** — Optimized for desktop, tablet, and mobile
- **Dark/Light Theme** — Toggle with persistent preference
- **Mobile Hamburger Menu** — Sidebar with chat history, theme toggle, system instruction, and logout
- **Centered Branding** — Beautiful gradient ChatMinds logo on mobile
- **Clean, Minimal Interface** — Focus on the conversation

### 🎙️ Voice Features
- **Voice Input (Speech-to-Text)** — Dictate messages using your microphone
- **Voice Output (Text-to-Speech)** — Listen to AI responses with quality voice selection
- **Smart Voice Selection** — Prioritizes Google/Microsoft voices for clarity

### 📷 Multimodal Support
- **Image Upload** — Send images with text prompts
- **Camera Capture** — Take photos directly on mobile
- **Image Context Memory** — AI remembers previous image analysis

### 📄 Export & Sharing
- **PDF Export** — Download conversation as formatted PDF
- **Copy Messages** — Quick copy for individual messages

### 🔐 Authentication
- **Demo Auth System** — localStorage-based login/registration
- **Protected Routes** — Home redirects to login if unauthenticated
- **Easy to Upgrade** — Replace with Firebase/Auth0 for production

---

## 📱 Mobile Experience

ChatMinds is designed mobile-first with:
- **Hamburger Sidebar** — Access chat history, theme, system instruction, and logout
- **Centered Header** — ChatMinds logo and name prominently displayed
- **Compact Assistant Selector** — Model picker positioned on the right
- **Touch-Friendly Controls** — Large tap targets for all buttons
- **Responsive Input** — Full-width text area with action buttons

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd chatgen
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and add your API keys:

```env
VITE_OPEN_AI_API_KEY=sk-...
VITE_GOOGLE_AI_API_KEY=...
VITE_ANTHROPIC_AI_API_KEY=...
VITE_X_AI_API_KEY=...
VITE_DEEPSEEK_AI_API_KEY=...
VITE_GROQ_API_KEY=...
```

> **Note:** Only configure the providers you want to use. LM Studio works locally without an API key.

### 3. Start Development Server

```bash
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

### 4. Access on Mobile (Same Network)

Find your computer's IP address and open `http://<your-ip>:5173` on your phone.

---

## 📁 Project Structure

```
chatgen/
├── public/                    # Static assets
│   └── chat-bot.png          # App logo
├── src/
│   ├── assistants/           # AI provider adapters
│   │   ├── openai.js         # OpenAI GPT models
│   │   ├── googleai.js       # Google Gemini
│   │   ├── anthropicai.js    # Anthropic Claude
│   │   ├── xai.js            # xAI Grok
│   │   ├── deepseekai.js     # DeepSeek (OpenRouter)
│   │   ├── groq.js           # Groq
│   │   ├── chatminds.js      # LM Studio local
│   │   └── pdfqa.js          # PDF Q&A assistant
│   ├── components/
│   │   ├── Assistant/        # Model selector dropdown
│   │   ├── Chat/             # Main chat container
│   │   ├── Controls/         # Input bar, voice, upload
│   │   ├── Messages/         # Message bubbles, copy
│   │   ├── Sidebar/          # Chat list, mobile menu
│   │   ├── SystemInstruction/# Persona editor
│   │   ├── Theme/            # Dark/light toggle
│   │   ├── Loader/           # Loading spinner
│   │   └── Auth/             # Protected route
│   ├── pages/
│   │   ├── Login.jsx         # Login page
│   │   └── Regestration.jsx  # Registration page
│   ├── utils/
│   │   ├── auth.js           # Demo authentication
│   │   └── exportPdf.js      # PDF export utility
│   ├── App.jsx               # Main app & routing
│   ├── App.module.css        # App styles
│   ├── index.css             # Global styles
│   └── main.jsx              # Entry point
├── server/                    # Backend server (optional)
│   └── index.js              # Express server for vectors/uploads
├── .env.example              # Environment template
├── package.json
├── vite.config.js
└── README.md
```

---

## 🎯 Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Home (Chat UI) | ✅ Yes |
| `/Login` | Login page | ❌ No |
| `/Regestration` | Registration page | ❌ No |

---

## 🔧 Adding a New AI Provider

1. Create `src/assistants/<provider>.js`:

```javascript
export class Assistant {
  constructor(systemPrompt) {
    this.systemPrompt = systemPrompt;
  }

  async chat(content, history) {
    // Return complete response string
  }

  async *chatStream(content, history) {
    // Yield chunks for streaming
  }
}
```

2. Add to `src/components/Assistant/Assistant.jsx`:
   - Import the adapter
   - Add to `assistantMap`
   - Add `<option>` in the selector

---

## 🛡️ Security Notes

⚠️ **Development Only:** API keys are exposed in the browser bundle. For production:
- Use a backend proxy to hide API keys
- Implement proper rate limiting
- Replace demo auth with Firebase/Auth0/custom backend

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Provider auth error | Check API key in `.env`, restart dev server |
| No voice input | Use Chrome/Edge (Safari limited support) |
| LM Studio not connecting | Ensure LM Studio server is running on port 1234 |
| Mobile mic not working | Grant microphone permission, use HTTPS in production |
| PDF export empty | Send at least one message first |

---

## 🗺️ Roadmap

- [ ] Backend API proxy for production
- [ ] Firebase/Auth0 integration
- [ ] Conversation search
- [ ] Chat export/import (JSON)
- [ ] Token usage tracking
- [ ] Custom theme colors
- [ ] Multi-user support

---

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

---

## 📄 License

MIT License — feel free to use and modify.

---

## 💜 Credits

Built with ❤️ using React, Vite, and multiple AI SDKs.

**ChatMinds** — Your unified AI conversation companion.
