# ChatMinds — Multi‑Assistant Chat UI

ChatMinds is a lightweight React + Vite chat interface that unifies multiple AI providers and offers a focused UI for experiments and local demos. It supports multiple assistants, persistent chat history, a global system instruction, streaming responses, and a simple localStorage-based authentication for demo purposes.

This README covers: features, repository structure, setup, routes, and notes about security and customization.

---

## Features

- Multi‑assistant support (OpenAI, Google Gemini, Anthropic, xAI, DeepSeek, and a ChatMinds alias)
- Model / assistant selector with optgroups
- Persistent multi‑chat sessions with auto‑titled conversations
- Global System Instruction editor (persisted to localStorage)
- LocalStorage-based demo authentication (register/login)
- Protected Home route that redirects to `/Login` if unauthenticated
- Responsive UI with a sidebar, message streaming, markdown rendering, and PDF export
- Basic multimodal support (send image + text) via provider adapters

---

## Routes

- `/` — Home (chat UI; protected)
- `/Login` — Login page
- `/Regestration` — Registration page

---

## Repository structure (important files)

```
chatgen/
├─ public/                # static assets (images, icons)
├─ src/
│  ├─ assistants/         # provider adapters (openai, googleai, anthropicai, xai, deepseekai, chatminds)
│  ├─ components/         # UI building blocks (Assistant, Chat, Sidebar, Controls, Messages, Theme, SystemInstruction, Auth)
│  ├─ pages/              # Login.jsx, Regestration.jsx
│  ├─ utils/              # helpers (auth.js, exportPdf.js, etc.)
│  ├─ App.jsx             # main app UI and routing
│  └─ main.jsx            # entry and router setup
├─ package.json
├─ vite.config.js
├─ .env.example
└─ README.md
```

---

## Setup (local)

1. Install dependencies:

```powershell
cd "c:\Users\MUKHTAR SAYYED\Downloads\chatgen\chatgen"
npm install
```

2. Start dev server:

```powershell
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173` or the next available port).

---

## Environment variables

Copy `.env.example` to `.env` and populate any provider keys you want to test:

```
VITE_OPEN_AI_API_KEY=...
VITE_GOOGLE_AI_API_KEY=...
VITE_ANTHROPIC_AI_API_KEY=...
VITE_X_AI_API_KEY=...
VITE_DEEPSEEK_AI_API_KEY=...
```

Security note: The project is set to allow browser usage of SDKs for local testing; do NOT put production secrets in client bundles. Use a backend proxy in production.

---

## Local auth (demo)

- A simple demo auth is implemented in `src/utils/auth.js`. It stores users and sessions in localStorage (plain text). This is convenient for local testing but insecure for real apps.
- To replace with real auth, wire Firebase/Auth0 or a backend endpoint and swap the `auth` util.

---

## How assistants work

- Each provider has an adapter in `src/assistants/` that exposes an `Assistant` class with `chat` and `chatStream` methods. The UI expects these methods so adapters can be swapped.
- To add a provider: create an adapter file, export the class, and register it in `src/components/Assistant/Assistant.jsx` (assistantMap and select options).

---

## Notes & troubleshooting

- If you see a "Maximum update depth exceeded" warning, it's typically caused by passing a non‑stable callback to a child `useEffect`. The app memoizes the assistant change handler to avoid this.
- If Vite complains about missing packages (e.g. `react-router-dom`), run `npm install`.
- ESLint: the project includes linting; you can run `npm run lint` to check issues.

---

## Next steps (recommended)

- Replace localStorage auth with a secure provider (Firebase/Auth0) for real users.
- Add unit/integration tests for assistant adapters.
- Use a backend proxy to hide API keys and enforce rate limits.

---

If you'd like, I can also add a `CONTRIBUTING.md`, a license file (MIT), or wire Firebase Authentication — tell me which and I will implement it next.

---

Happy hacking — open an issue or tell me what next customization you want.

# MultiAI Chat Studio

A lightweight, extensible React + Vite application for unified conversational AI across multiple model providers (OpenAI, Anthropic Claude, Google Gemini, DeepSeek via OpenRouter, and xAI Grok). Supports persistent multi-chat sessions, global system instructions for persona control, streaming responses, multimodal (image + text) queries, PDF export, voice input (speech recognition), voice output (speech synthesis), theming, and easy provider extension.

## Key Features

- **Multi‑Provider Switching:** Plug‑and‑play assistants: OpenAI, Anthropic, Google, DeepSeek (OpenRouter), xAI. Encapsulated in `src/assistants/*`.
- **Streaming Responses:** Real‑time token streaming for supported providers.
- **Global System Instruction:** Persisted persona/instruction stored in `localStorage` and injected per chat.
- **Multi‑Chat Management:** Sidebar with titled sessions (auto‑title from first user message) and deletion.
- **Image + Text (Multimodal) Queries:** Upload or capture images; converted to provider‑specific payloads.
- **Automatic Image Context Recall:** Compact summary of last analyzed image reused as system hint in subsequent queries.
- **Voice Input (Speech Recognition):** Start/stop mic capture (browser support gated).
- **Voice Output (Speech Synthesis):** Hear last assistant response; cancel/stop controls.
- **Markdown Rendering:** Assistant responses rendered via `react-markdown`.
- **Copy Response Button:** One‑click copy per assistant message.
- **PDF Export:** Structured “Query / Info” pairing via `exportChatToPdf` (`src/utils/exportPdf.js`).
- **Responsive Controls:** Mobile friendly action grouping with menu overlay.
- **Persistent State:** Chats, active chat ID, and system instruction saved across reloads.
- **Theming Support:** Light/dark (see `Theme` component) – extendable.
- **Error Handling & Partial Streaming:** Robust try/catch with graceful fallbacks.

## Technology Stack

- **Framework:** React 18 + Vite
- **Styling:** CSS Modules
- **AI SDKs:** `openai`, `@anthropic-ai/sdk`, `@google/genai`, `@google/generative-ai`, OpenRouter (DeepSeek), xAI Grok
- **Utilities:** `uuid` for IDs, `react-markdown` for rendering, `jspdf` for PDF
- **Tooling:** ESLint (Flat config), `@vitejs/plugin-react`

## Project Structure

```
chatgen/
  ├─ src/
  │  ├─ App.jsx                # Root composition & persistence logic
  │  ├─ assistants/            # Provider adapter classes
  │  │   ├─ openai.js          # OpenAI (GPT‑4o mini default)
  │  │   ├─ anthropicai.js     # Claude (system prompt extraction)
  │  │   ├─ googleai.js        # Gemini (system prompt concatenation)
  │  │   ├─ deepseekai.js      # DeepSeek via OpenRouter (extends OpenAI adapter)
  │  │   ├─ xai.js             # Grok via OpenAI interface
  │  ├─ components/
  │  │   ├─ Chat/              # Chat session container (stream logic, image handling)
  │  │   ├─ Messages/          # Grouping, markdown, copy button
  │  │   ├─ Controls/          # Input bar, voice, image, PDF export
  │  │   ├─ Sidebar/           # Session list management
  │  │   ├─ Assistant/         # Provider/model selector UI
  │  │   ├─ SystemInstruction/ # Persona/system prompt editor
  │  │   ├─ Theme/             # Theme toggler
  │  │   ├─ Loader/            # Loading spinner overlay
  │  ├─ utils/
  │  │   └─ exportPdf.js       # PDF export (Query/Info pairing)
  │  ├─ index.css / App.module.css
  │  ├─ main.jsx               # React entry
  ├─ convert-to-pdf.js         # README → PDF script (basic markdown → PDF)
  ├─ .env.example              # Environment variable template
  ├─ package.json
  ├─ vite.config.js
  ├─ eslint.config.js
  └─ README.md
```

## Environment Variables

Copy `.env.example` to `.env` or `.env.local` and fill values:

```
VITE_GOOGLE_AI_API_KEY=...
VITE_OPEN_AI_API_KEY=...
VITE_DEEPSEEK_AI_API_KEY=...
VITE_ANTHROPIC_AI_API_KEY=...
VITE_X_AI_API_KEY=...
```

Only the providers you use need values. Empty keys will cause auth errors when selected.

## Installation

```powershell
# Clone
git clone <your-fork-url> multiai-chat-studio
cd multiai-chat-studio/chatgen

# Install deps
npm install

# Configure env
cp .env.example .env
# (Then edit .env with your API keys)

# Start dev server
npm run dev
```
Vite will print the local dev URL (usually http://localhost:5173).

## Usage Walkthrough

1. Open the app; a default empty chat is created automatically.
2. Set a global system instruction (persona) in the header.
3. Pick an assistant/provider.
4. Type a message (Enter submits; Shift+Enter adds newline).
5. (Optional) Upload/capture an image – it’s attached to the next message only.
6. Watch streaming reply appear token-by-token.
7. Use copy buttons for specific responses.
8. Start a new chat via sidebar once the current has at least one message.
9. Export the current chat to PDF from the controls (desktop or mobile menu).
10. Switch provider mid-conversation; existing context is transformed as needed (e.g. Google gemini rebuilds chat with `createChat`).

## PDF Export Details

- Implemented in `exportPdf.js` using `jsPDF`.
- Filters out system + image messages; pairs first user with subsequent assistant messages until next user.
- Produces sections: `Query:` and `Info:`.
- Auto filename includes date/time.
- Use the PDF button in controls or mobile menu.

## Adding a New Provider

1. Create `src/assistants/<provider>.js` exporting `class Assistant`.
2. Match interface:
   - `chat(content, history)` → returns final string.
   - `chatStream(content, history)` → async generator yielding incremental chunks (string).
3. Handle multimodal input: if `content` is an object with `{ text, imageDataUrl }` adapt to provider’s format.
4. Inject system prompt (either in history or via provider’s API field) similar to existing adapters.
5. Update the `Assistant` selector component UI to include the new option.

## Handling System Instructions

- Stored in `localStorage` key `systemInstruction`.
- Inserted as first system role message in history OR concatenated (Google) before user content.
- Changing the instruction rebuilds Google chat sessions for correct context injection.

## Voice Features

- Speech Recognition: Uses `window.SpeechRecognition`/`webkitSpeechRecognition` if available.
- Speech Synthesis: Uses `window.speechSynthesis` and `SpeechSynthesisUtterance` for last assistant reply.
- Graceful degradation: Buttons disabled if the browser lacks support.

## Multimodal Flow

1. User selects/captures image (stored temporarily as data URL + object URL).
2. On send, an image preview message is added; payload includes `{ text, imageDataUrl }`.
3. Provider adapter builds correct parts/blocks for image + text.
4. After response, image context summary stored (first 2000 chars) for follow-up reference.

## Auto Chat Title Logic

- When first assistant/user messages appear, chat title is derived from first message: first 7 words.
- Stored in each chat object; persisted with entire chat array.

## Error Handling Patterns

- Try/catch around every provider call; error parsed where possible.
- On error, a system role message is appended to chat with a human-friendly notice.
- Stream errors surface early; partial content retained.

## Performance & Persistence

- Local-only state (no server) reduces latency.
- `localStorage` used for chats, active chat ID, and system instruction with defensive JSON parse.
- Streaming avoids large payload blocking; incremental rendering is cheap.

## Security Considerations

- API keys exposed to browser (client-side). Treat this as a prototype / personal tool.
- For production, proxy calls through a secure backend to avoid exposing secrets.

## Accessibility Notes

- Buttons include `title` / `aria-label` and `aria-pressed` where stateful.
- Voice toast uses `role="status"`.
- Copy feedback is time-limited and visually toggled.

## Troubleshooting

| Problem | Possible Cause | Fix |
|---------|----------------|-----|
| Provider auth error | Missing/invalid API key | Set correct key in `.env` and restart dev server |
| No voice input button | Browser doesn’t support Web Speech API | Use Chrome desktop or update browser |
| Image not processed | Unsupported provider image format | Check adapter mapping / data URL parsing |
| PDF export blank | No user/assistant messages in chat | Send at least one message before export |
| Streaming stops early | Network hiccup or provider error | Retry; check console for detailed error |

## Roadmap Ideas

- Server proxy for secret protection
- Model selection dropdown per provider
- Conversation search & tagging
- Import/export JSON chat history
- Token usage + cost estimation panel
- Theme customization palette
- Authentication layer (optional multi-user)

## License

No explicit license provided — add one (e.g. MIT) for clarity if distributing.

## Credits

Built with ❤️ using React, Vite, and multiple AI SDKs.

---
**MultiAI Chat Studio** – A unified playground for modern AI assistants.
