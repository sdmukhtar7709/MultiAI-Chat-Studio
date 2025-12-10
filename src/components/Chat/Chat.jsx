import { useEffect, useState } from "react";
import { Loader } from "../Loader/Loader";
import { Messages } from "../Messages/Messages";
import { Controls } from "../Controls/Controls";
import styles from "./Chat.module.css";
import { exportChatToPdf } from "../../utils/exportPdf";

export function Chat({
  assistant,
  systemPrompt,
  isActive = false,
  chatId,
  chatMessages,
  onChatMessagesUpdate,
}) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingImage, setPendingImage] = useState(null); // { dataUrl, objectUrl, name }
  const [lastImageSummary, setLastImageSummary] = useState(""); // text summary of last analyzed image

  useEffect(() => {
    setMessages(chatMessages);

    if (assistant?.name === "googleai") {
      // Recreate Google chat session when chat changes or systemPrompt updates
      assistant.createChat(chatMessages, systemPrompt);
    }
  }, [chatId, systemPrompt]);

  useEffect(() => {
    onChatMessagesUpdate(chatId, messages);
  }, [messages]);

  // Appends new content to the last message (used for streaming AI responses)
  function updateLastMessageContent(content) {
    setMessages((prevMessages) =>
      prevMessages.map((message, index) =>
        index === prevMessages.length - 1
          ? { ...message, content: `${message.content}${content}` }
          : message
      )
    );
  }

  // Add a new message to the chat
  function addMessage(message) {
    setMessages((prevMessages) => [...prevMessages, message]);
  }

  // Send user message to AI and stream the response
  async function handleContentSend(content) {
    addMessage({ content, role: "user" });
    setIsLoading(true);

    try {
      // If there's a pending image, include it in the payload and also display it
      let payload = content;
      if (pendingImage) {
        // Show image and text as two messages from the user
        addMessage({ role: "user", type: "image", imageUrl: pendingImage.objectUrl, alt: pendingImage.name });
        payload = { text: content, imageDataUrl: pendingImage.dataUrl };
      }

      // Build conversation history: system prompt + image context + text messages
      const history = [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        ...(lastImageSummary && !pendingImage
          ? [{ role: "system", content: `Previous image context: ${lastImageSummary}` }]
          : []),
        ...messages.filter((m) => m.role !== "system" && m.type !== "image"),
      ];
      const result = await assistant.chatStream(payload, history);

      // Stream AI response chunk by chunk for real-time display
      let isFirstChunk = false;
      let assistantReply = "";
      for await (const chunk of result) {
        if (!isFirstChunk) {
          isFirstChunk = true;
          addMessage({ content: "", role: "assistant" });
          setIsLoading(false);
          setIsStreaming(true);
        }
        assistantReply += chunk;
        updateLastMessageContent(chunk);
      }

      // After first completed response, clear the pending image so it
      // is not reused for subsequent queries
      if (pendingImage) {
        try { URL.revokeObjectURL(pendingImage.objectUrl); } catch {}
        setPendingImage(null);
        // Store a compact summary for follow-up questions
        setLastImageSummary(assistantReply.slice(0, 2000));
      }

      setIsStreaming(false);
    } catch (error) {
      addMessage({
        content:
          error?.message ??
          "Sorry, I couldn't process your request. Please try again!",
        role: "system",
      });
      // Also clear any pending image on failure to avoid accidental reuse
      if (pendingImage) {
        try { URL.revokeObjectURL(pendingImage.objectUrl); } catch {}
        setPendingImage(null);
      }
      setIsLoading(false);
      setIsStreaming(false);
    }
  }

  // Handle image upload: convert to base64 for AI and create preview URL
  async function handleImageSend(file) {
    // Read the image as a data URL
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    // Create a light-weight object URL for UI thumbnail preview next to the upload icon
    const objectUrl = URL.createObjectURL(file);
    setPendingImage({ dataUrl, objectUrl, name: file.name });
  }

  // Export current chat to PDF file
  function handleExportPdf() {
    try {
      const filename = `Chat Export ${new Date().toLocaleDateString()} ${new Date()
        .toLocaleTimeString()
        .replace(/:/g, '-')}.pdf`;
      exportChatToPdf(messages, filename);
    } catch (e) {
      console.error("PDF export failed", e);
    }
  }

  if (!isActive) return null;

  // Get last assistant message for speaker feature
  const lastAssistantMessage = [...messages].reverse().find(m => m.role === "assistant");
  const lastAssistantText = lastAssistantMessage?.content || "";

  return (
    <>
      {isLoading && <Loader />}

      <div className={styles.Chat}>
        <Messages messages={messages} />
      </div>

      <Controls
        isDisabled={isLoading || isStreaming}
        onSend={handleContentSend}
        onSendImage={handleImageSend}
        pendingImageUrl={pendingImage?.objectUrl}
        lastAssistantText={lastAssistantText}
        onExportChat={handleExportPdf}
      />
    </>
  );
}
