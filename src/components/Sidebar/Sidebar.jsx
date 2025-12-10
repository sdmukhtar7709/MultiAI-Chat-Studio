import { useState } from "react";
import { Theme } from "../Theme/Theme";
import { SystemInstruction } from "../SystemInstruction/SystemInstruction";
import styles from "./Sidebar.module.css";

export function Sidebar({
  chats,
  activeChatId,
  activeChatMessages,
  onActiveChatIdChange,
  onNewChatCreate,
  onChatDelete,
  onLogout,
  systemPrompt,
  onSystemPromptChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Toggle mobile sidebar open/closed
  function handleSidebarToggle() {
    setIsOpen(!isOpen);
  }

  // Toggle sidebar collapsed/expanded (desktop)
  function handleCollapseToggle() {
    setIsCollapsed(!isCollapsed);
  }

  // Close sidebar when Escape key is pressed
  function handleEscapeClick(event) {
    if (isOpen && event.key === "Escape") {
      setIsOpen(false);
    }
  }

  // Handle chat selection and close mobile sidebar
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

      <div 
        className={styles.Sidebar} 
        data-open={isOpen} 
        data-collapsed={isCollapsed}
      >
        <div className={styles.SidebarHeader}>
          <button
            className={styles.CollapseButton}
            onClick={handleCollapseToggle}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <CollapseIcon collapsed={isCollapsed} />
          </button>
          {!isCollapsed && (
            <button
              className={styles.NewChatButton}
              disabled={activeChatMessages.length === 0}
              onClick={onNewChatCreate}
            >
              <PlusIcon size={18} />
              New Chat
            </button>
          )}
          {isCollapsed && (
            <button
              className={styles.NewChatButtonCollapsed}
              disabled={activeChatMessages.length === 0}
              onClick={onNewChatCreate}
              title="New Chat"
            >
              <PlusIcon />
            </button>
          )}
        </div>

        <ul className={styles.Chats}>
          {chats
            .filter(({ messages }) => messages.length > 0)
            .map((chat) => {
              // Format creation date for tooltip
              const createdDate = chat.createdAt ? new Date(chat.createdAt) : null;
              const tooltipText = createdDate
                ? `Created: ${createdDate.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })} at ${createdDate.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`
                : '';

              return (
                <li
                  key={chat.id}
                  className={styles.Chat}
                  data-active={chat.id === activeChatId}
                  data-collapsed={isCollapsed}
                  onClick={() => handleChatClick(chat.id)}
                  title={isCollapsed ? chat.title : tooltipText}
                >
                  <button className={styles.ChatButton}>
                    {isCollapsed ? (
                      <div className={styles.ChatIcon}>
                        <ChatBubbleIcon />
                      </div>
                    ) : (
                      <div className={styles.ChatTitle}>{chat.title}</div>
                    )}
                  </button>
                  {!isCollapsed && (
                    <div className={styles.ChatActions}>
                      <button
                        className={styles.ShareButton}
                        title="Share chat"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Share functionality to be added
                        }}
                      >
                        <ShareIcon />
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
                    </div>
                  )}
                </li>
              );
            })}
        </ul>

        {/* Mobile Footer with System Instruction, Theme and Logout */}
        <div className={styles.MobileFooter}>
          <div className={styles.MobileFooterItem}>
            <SettingsIcon />
            <span>System Instruction</span>
            <SystemInstruction value={systemPrompt} onChange={onSystemPromptChange} />
          </div>
          <div className={styles.MobileFooterItem}>
            <ThemeIcon />
            <span>Theme</span>
            <Theme />
          </div>
          <button
            className={styles.MobileLogoutButton}
            onClick={() => {
              setIsOpen(false);
              onLogout?.();
            }}
          >
            <LogoutIcon />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className={styles.Overlay} onClick={handleSidebarToggle} />
      )}
    </>
  );
}

// ===== ICON COMPONENTS =====

// Hamburger menu icon for mobile sidebar toggle
function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="#1f1f1f">
      <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
    </svg>
  );
}

// Arrow icon for collapse/expand sidebar
function CollapseIcon({ collapsed }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"
      style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
  );
}

// Plus icon for "New Chat" button
function PlusIcon({ size = 20 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 0 24 24" width={size} fill="currentColor">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

// Chat bubble icon for collapsed sidebar
function ChatBubbleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
    </svg>
  );
}

// Trash icon for delete chat
function DeleteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  );
}

// Share icon for sharing chat
function ShareIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="16" fill="currentColor">
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
    </svg>
  );
}

// Moon icon for theme toggle
function ThemeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor">
      <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
    </svg>
  );
}

// Gear icon for settings/system instruction
function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor">
      <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
    </svg>
  );
}

// Door/exit icon for logout
function LogoutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor">
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
    </svg>
  );
}
