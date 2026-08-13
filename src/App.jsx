import { useEffect, useMemo, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { Chat } from "./components/Chat/Chat";
import { Assistant } from "./components/Assistant/Assistant";
import { Theme } from "./components/Theme/Theme";
import { SystemInstruction } from "./components/SystemInstruction/SystemInstruction";
import styles from "./App.module.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Regestration from "./pages/Regestration";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import { logout } from "./utils/auth";

function Home() {
  const navigate = useNavigate();
  const [assistant, setAssistant] = useState();
  const [chats, setChats] = useState(() => {
    try {
      const saved = localStorage.getItem("chats");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activeChatId, setActiveChatId] = useState(() =>
    localStorage.getItem("activeChatId") || undefined
  );

  // Global system instruction (persisted) - start with a fixed default
  const DEFAULT_SYSTEM_PROMPT =
    "You are ChatMind-AI, created by ChatMind Corporation under Sameer. Provide clear, accurate, polite, and easy-to-understand answers. Use step-by-step reasoning for complex questions and prioritize user satisfaction.";

  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);

  const activeChatMessages = useMemo(
    () => chats.find(({ id }) => id === activeChatId)?.messages ?? [],
    [chats, activeChatId]
  );

  useEffect(() => {
    // Initialize chat on mount
    if (!chats.length) {
      handleNewChatCreate();
    } else if (!activeChatId && chats.length) {
      setActiveChatId(chats[0].id);
    }
  }, []);

  // Persist chats
  useEffect(() => {
    try {
      localStorage.setItem("chats", JSON.stringify(chats));
    } catch (e) {
      console.warn("Failed to persist chats", e);
    }
  }, [chats]);

  useEffect(() => {
    if (activeChatId) localStorage.setItem("activeChatId", activeChatId);
  }, [activeChatId]);

  useEffect(() => {
    localStorage.setItem("systemInstruction", systemPrompt);
  }, [systemPrompt]);

  // Stable callback for assistant changes
  const handleAssistantChangeMemo = useCallback((newAssistant) => {
    setAssistant(newAssistant);
  }, []);

  // Update chat messages and auto-generate title from first 7 words
  function handleChatMessagesUpdate(id, messages) {
    const title = messages[0]?.content.split(" ").slice(0, 7).join(" ");

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === id
          ? { ...chat, title: chat.title ?? title, messages }
          : chat
      )
    );
  }

  // Create a new empty chat and make it active
  function handleNewChatCreate() {
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    setActiveChatId(id);
    setChats((prevChats) => [...prevChats, { id, messages: [], createdAt }]);
  }

  // Switch to chat and remove any empty chats
  function handleActiveChatIdChange(id) {
    setActiveChatId(id);
    setChats((prevChats) =>
      prevChats.filter(({ messages }) => messages.length > 0)
    );
  }

  // Delete a chat and switch to another if needed
  function handleChatDelete(id) {
    setChats((prev) => prev.filter((c) => c.id !== id));
    setActiveChatId((prevActive) => {
      if (prevActive === id) {
        const remaining = chats.filter((c) => c.id !== id);
        return remaining[0]?.id;
      }
      return prevActive;
    });
  }

  return (
    <div className={styles.App}>
      <header className={styles.Header}>
        <div
          className={styles.Brand}
          onClick={() => window.location.reload()}
          style={{ cursor: 'pointer' }}
          title="Refresh page"
        >
          <img className={styles.Logo} src="/chat-bot.png" />
          <h2 className={styles.Title}>ChatMinds</h2>
          <Theme />
        </div>
        <div className={styles.Configuration}>
          <SystemInstruction value={systemPrompt} onChange={setSystemPrompt} />
          <Assistant onAssistantChange={handleAssistantChangeMemo} />
        </div>
        <div className={styles.TopRight}>
          <button
            className={styles.LogoutButton}
            onClick={() => {
              logout();
              navigate("/Login");
            }}
            title="Logout"
          >
            Logout
          </button>
        </div>
      </header>

      <div className={styles.Content}>
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          activeChatMessages={activeChatMessages}
          onActiveChatIdChange={handleActiveChatIdChange}
          onNewChatCreate={handleNewChatCreate}
          onChatDelete={handleChatDelete}
          onLogout={() => {
            logout();
            navigate("/Login");
          }}
          systemPrompt={systemPrompt}
          onSystemPromptChange={setSystemPrompt}
        />

        <main className={styles.Main}>
          {chats.map((chat) => (
            <Chat
              key={chat.id}
              assistant={assistant}
              systemPrompt={systemPrompt}
              isActive={chat.id === activeChatId}
              chatId={chat.id}
              chatMessages={chat.messages}
              onChatMessagesUpdate={handleChatMessagesUpdate}
            />
          ))}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Regestration" element={<Regestration />} />
    </Routes>
  );
}
