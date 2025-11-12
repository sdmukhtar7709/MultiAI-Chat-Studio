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

  // ✅ Global system instruction for chatbot personality (persisted)
  const [systemPrompt, setSystemPrompt] = useState(() =>
    localStorage.getItem("systemInstruction") ?? "your name is mukhtar"
  );

  const activeChatMessages = useMemo(
    () => chats.find(({ id }) => id === activeChatId)?.messages ?? [],
    [chats, activeChatId]
  );

  useEffect(() => {
    // Initialize a chat if none exists
    if (!chats.length) {
      handleNewChatCreate();
    } else if (!activeChatId && chats.length) {
      setActiveChatId(chats[0].id);
    }
    // We intentionally only want this to run on mount to initialize the chat
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist chats and active chat id
  useEffect(() => {
    try {
      localStorage.setItem("chats", JSON.stringify(chats));
    } catch (e) {
      // If persisting fails (e.g., storage quota), log a warning but continue
      // so the app remains usable.
  console.warn("Failed to persist chats", e);
    }
  }, [chats]);

  useEffect(() => {
    if (activeChatId) localStorage.setItem("activeChatId", activeChatId);
  }, [activeChatId]);

  useEffect(() => {
    localStorage.setItem("systemInstruction", systemPrompt);
  }, [systemPrompt]);

  // Stable callback so child effects can depend on it without causing loops
  const handleAssistantChangeMemo = useCallback((newAssistant) => {
    setAssistant(newAssistant);
  }, []);

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

  function handleNewChatCreate() {
    const id = uuidv4();

    setActiveChatId(id);
    setChats((prevChats) => [...prevChats, { id, messages: [] }]);
  }

  function handleActiveChatIdChange(id) {
    setActiveChatId(id);
    setChats((prevChats) =>
      prevChats.filter(({ messages }) => messages.length > 0)
    );
  }

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
        <div className={styles.Brand}>
          <img className={styles.Logo} src="/chat-bot.png" />
          <h2 className={styles.Title}>ChatMinds</h2>
        </div>
        <div className={styles.Configuration}>
          <SystemInstruction value={systemPrompt} onChange={setSystemPrompt} />
          <Assistant onAssistantChange={handleAssistantChangeMemo} />
          <div className={styles.ThemeRight}>
            <Theme />
          </div>
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
        />

        <main className={styles.Main}>
          {chats.map((chat) => (
            <Chat
              key={chat.id}
              assistant={assistant}
              systemPrompt={systemPrompt} // ✅ Passed to Chat component
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
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Regestration" element={<Regestration />} />
    </Routes>
  );
}
