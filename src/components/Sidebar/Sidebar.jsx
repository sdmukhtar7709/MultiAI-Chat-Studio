import { useState } from "react";
import styles from "./Sidebar.module.css";

export function Sidebar({
  chats,
  activeChatId,
  activeChatMessages,
  onActiveChatIdChange,
  onNewChatCreate,
  onChatDelete,
}) {
  const [isOpen, setIsOpen] = useState(false);

  function handleSidebarToggle() {
    setIsOpen(!isOpen);
  }

  function handleEscapeClick(event) {
    if (isOpen && event.key === "Escape") {
      setIsOpen(false);
    }
  }

  function handleChatClick(chatId) {
    onActiveChatIdChange(chatId);

    if (isOpen) {
      setIsOpen(false);
    }
  }

  return (
    <>
      <button
        className={styles.MenuButton}
        onClick={handleSidebarToggle}
        onKeyDown={handleEscapeClick}
      >
        <MenuIcon />
      </button>

      <div className={styles.Sidebar} data-open={isOpen}>
        <button
          className={styles.NewChatButton}
          disabled={activeChatMessages.length === 0}
          onClick={onNewChatCreate}
        >
          New Chat
        </button>

        <ul className={styles.Chats}>
          {chats
            .filter(({ messages }) => messages.length > 0)
            .map((chat) => (
              <li
                key={chat.id}
                className={styles.Chat}
                data-active={chat.id === activeChatId}
                onClick={() => handleChatClick(chat.id)}
              >
                <button className={styles.ChatButton}>
                  <div className={styles.ChatTitle}>{chat.title}</div>
                </button>
                <button
                  className={styles.DeleteButton}
                  title="Delete chat"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChatDelete?.(chat.id);
                  }}
                >
                  <DeleteIcon />
                </button>
              </li>
            ))}
        </ul>
      </div>

      {isOpen && (
        <div className={styles.Overlay} onClick={handleSidebarToggle} />
      )}
    </>
  );
}

function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      fill="#1f1f1f"
    >
      <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="18"
      viewBox="0 0 24 24"
      width="18"
      fill="currentColor"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  );
}
