import { useRef, useEffect, useMemo, useState } from "react";
import Markdown from "react-markdown";
import styles from "./Messages.module.css";

const WELCOME_MESSAGE_GROUP = [
  {
    role: "assistant",
    content: "Hello! How can I assist you right now?",
  },
];

export function Messages({ messages }) {
  const messagesEndRef = useRef(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const messagesGroups = useMemo(
    () =>
      messages.reduce((groups, message) => {
        if (message.role === "user") groups.push([]);
        groups[groups.length - 1].push(message);
        return groups;
      }, []),
    [messages]
  );

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    if (lastMessage?.role === "user") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className={styles.Messages}>
      {[WELCOME_MESSAGE_GROUP, ...messagesGroups].map(
        (messages, groupIndex) => (
          // Group
          <div key={groupIndex} className={styles.Group}>
            {messages.map((message, index) => (
              // Message
              <div key={index} className={styles.Message} data-role={message.role}>
                {message.type === "image" ? (
                  <img
                    className={styles.Image}
                    src={message.imageUrl}
                    alt={message.alt || "uploaded image"}
                  />
                ) : (
                  <>
                    <Markdown>{message.content}</Markdown>
                    {message.role === "assistant" && (
                      <CopyButton
                        message={message}
                        copiedKey={copiedKey}
                        uniqueKey={`${groupIndex}-${index}`}
                        setCopiedKey={setCopiedKey}
                      />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

function CopyButton({ message, copiedKey, uniqueKey, setCopiedKey }) {
  const handleCopy = () => {
    const text = message.content || "";
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.top = "-1000px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedKey(uniqueKey);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === uniqueKey ? null : prev));
      }, 1500);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const isCopied = copiedKey === uniqueKey;
  return (
    <button
      type="button"
      className={styles.CopyButton}
      data-copied={isCopied ? "true" : "false"}
      aria-label={isCopied ? "Copied" : "Copy response"}
      onClick={handleCopy}
    >
      {isCopied ? (
        <span>Copied</span>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.CopyIcon}
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4c0-1.1.9-2 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}
