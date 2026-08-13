import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TextareaAutosize from "react-textarea-autosize";
import { isAuthenticated } from "../../utils/auth";
import styles from "./Controls.module.css";

export function Controls({ isDisabled = false, onSend, onSendImage, pendingImageUrl, lastAssistantText = "", onExportChat }) {
  const navigate = useNavigate();
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const [content, setContent] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    if (!isDisabled && isAuthenticated()) {
      textareaRef.current?.focus();
    }
  }, [isDisabled]);

  function requireAuthForChatAction() {
    if (!isAuthenticated()) {
      navigate("/Login");
      return true;
    }
    return false;
  }

  // Update textarea content as user types
  function handleContentChange(event) {
    setContent(event.target.value);
  }

  // Send message when user clicks send button
  function handleContentSend() {
    if (requireAuthForChatAction()) return;
    if (content.length > 0) {
      onSend(content);
      setContent("");
    }
  }

  // Send message when Enter is pressed (Shift+Enter for new line)
  function handleEnterPress(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleContentSend();
    }
  }

  // Open file picker for image upload
  function handleUploadClick() {
    if (isDisabled) return;
    fileInputRef.current?.click();
  }

  // Open camera for taking photo (mobile)
  function handleCameraClick() {
    if (isDisabled) return;
    cameraInputRef.current?.click();
  }

  // Handle file selection from file picker or camera
  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (file && onSendImage) {
      onSendImage(file);
    }
    // Reset input so the same file can be selected again
    event.target.value = "";
  }

  // Check if browser supports speech-to-text
  function isSpeechRecognitionSupported() {
    return typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  // Check if browser supports text-to-speech
  function isSpeechSynthesisSupported() {
    return typeof window !== "undefined" && !!window.speechSynthesis && "SpeechSynthesisUtterance" in window;
  }

  // Toggle voice input: start/stop speech recognition
  function handleMicClick() {
    if (isDisabled) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      // stop
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
      return;
    }

    // start
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = navigator.language || "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      // focus textarea so user sees the input
      textareaRef.current?.focus();
    };

    recognition.onresult = (event) => {
      try {
        // Extract transcript from all recognition results
        const transcript = Array.from(event.results)
          .map((r) => r[0].transcript)
          .join(" ");
        if (transcript && transcript.trim().length > 0) {
          setContent((prev) => (prev && prev.length > 0 ? prev + " " + transcript : transcript));
        }
      } catch (e) {
        // ignore parse errors
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      // some browsers throw if start called repeatedly
    }
  }

  // Toggle mobile "more actions" menu open/closed
  function toggleMoreMenu() {
    setMoreOpen((v) => !v);
  }

  // Preload voices (some browsers load them async)
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Trigger voice loading
      window.speechSynthesis.getVoices();
      // Listen for voices changed event
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
      try {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      } catch (e) {}
    };
  }, []);

  // Read aloud the last AI response using text-to-speech
  function handleSpeakClick() {
    if (isDisabled) return;
    if (!isSpeechSynthesisSupported()) return;

    const synth = window.speechSynthesis;
    if (isSpeaking) {
      try { synth.cancel(); } catch {}
      setIsSpeaking(false);
      return;
    }

    const text = (lastAssistantText || "").trim();
    if (!text) return;

    // Clean text for better speech (remove markdown, code blocks, etc.)
    const cleanText = text
      .replace(/```[\s\S]*?```/g, ' code block ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n+/g, '. ')
      .trim();

    const utter = new window.SpeechSynthesisUtterance(cleanText);
    
    // Get available voices and select a good English voice
    const voices = synth.getVoices();
    const preferredVoices = [
      'Google US English',
      'Google UK English Female',
      'Google UK English Male',
      'Microsoft Zira',
      'Microsoft David',
      'Samantha',
      'Alex',
      'Karen',
      'Daniel'
    ];
    
    // Find the best voice
    let selectedVoice = null;
    for (const preferred of preferredVoices) {
      selectedVoice = voices.find(v => v.name.includes(preferred));
      if (selectedVoice) break;
    }
    
    // Fallback to any English voice
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('en'));
    }
    
    if (selectedVoice) {
      utter.voice = selectedVoice;
      utter.lang = selectedVoice.lang;
    } else {
      utter.lang = "en-US";
    }
    
    utter.rate = 0.95; // Slightly slower for clarity
    utter.pitch = 1;
    utter.volume = 1;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    
    try {
      synth.cancel(); // cancel any previous
      synth.speak(utter);
    } catch {}
  }

  return (
    <div className={styles.Controls}>
      {/* Upload image button (left-most) */}
      <button
        className={styles.Button}
        title="Upload image"
        disabled={isDisabled}
        onClick={handleUploadClick}
      >
        <UploadIcon />
      </button>
      {/* Mobile-only: Take photo (camera capture) */}
      <button
        className={`${styles.Button} ${styles.MobileOnly}`}
        title="Take photo"
        aria-label="Take photo"
        disabled={isDisabled}
        onClick={handleCameraClick}
      >
        <CameraIcon />
      </button>
      {/* Mobile: extra actions inside a compact menu */}
      <button
        className={`${styles.Button} ${styles.MobileOnly}`}
        title={moreOpen ? "Close actions" : "More actions"}
        aria-label={moreOpen ? "Close actions" : "More actions"}
        disabled={isDisabled}
        onClick={toggleMoreMenu}
        aria-expanded={moreOpen}
      >
        {moreOpen ? <CloseIcon /> : <MenuIcon />}
      </button>
      {pendingImageUrl && (
        <img className={styles.Thumb} src={pendingImageUrl} alt="preview" />
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      {/* Separate hidden input for direct camera capture on mobile */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <div className={styles.TextAreaContainer}>
        <TextareaAutosize
          ref={textareaRef}
          className={styles.TextArea}
          disabled={isDisabled}
          placeholder="Message AI Chatbot"
          value={content}
          minRows={1}
          maxRows={4}
          onChange={handleContentChange}
          onKeyDown={handleEnterPress}
        />
      </div>
      <button
        className={`${styles.Button} ${styles.HiddenOnMobile}`}
        title={isSpeechRecognitionSupported() ? (isListening ? "Stop recording" : "Start voice input") : "Voice not supported"}
        disabled={isDisabled || !isSpeechRecognitionSupported()}
        onClick={handleMicClick}
        aria-pressed={isListening}
      >
        <MicIcon active={isListening} />
      </button>
      <button
        className={`${styles.Button} ${styles.HiddenOnMobile}`}
        title={isSpeechSynthesisSupported() ? (isSpeaking ? "Stop speaking" : "Hear last response") : "Speaker not supported"}
        disabled={isDisabled || !isSpeechSynthesisSupported() || !lastAssistantText}
        onClick={handleSpeakClick}
        aria-pressed={isSpeaking}
      >
        <HearIcon active={isSpeaking} />
      </button>
      <button
        className={`${styles.Button} ${styles.HiddenOnMobile}`}
        title="Export chat to PDF"
        disabled={isDisabled || !onExportChat}
        onClick={onExportChat}
      >
        <PdfIcon />
      </button>
      <button
        className={`${styles.Button} ${styles.SendButton}`}
        disabled={isDisabled}
        onClick={handleContentSend}
      >
        <SendIcon />
      </button>
      {isListening && (
        <div className={styles.MicToast} role="status" aria-live="polite">
          <span className={styles.MicToastDot} />
          Say something…
        </div>
      )}

      {moreOpen && (
        <>
        <div className={styles.MoreOverlay} onClick={() => setMoreOpen(false)} />
        <div className={styles.MoreMenu} role="menu">
          <button
            className={styles.MoreItem}
            role="menuitem"
            title={isSpeechRecognitionSupported() ? (isListening ? "Stop recording" : "Start voice input") : "Voice not supported"}
            disabled={isDisabled || !isSpeechRecognitionSupported()}
            onClick={handleMicClick}
          >
            <MicIcon active={isListening} /> Voice
          </button>
          <button
            className={styles.MoreItem}
            role="menuitem"
            title={isSpeechSynthesisSupported() ? (isSpeaking ? "Stop speaking" : "Hear last response") : "Speaker not supported"}
            disabled={isDisabled || !isSpeechSynthesisSupported() || !lastAssistantText}
            onClick={handleSpeakClick}
          >
            <HearIcon active={isSpeaking} /> Hearing
          </button>
          <button
            className={styles.MoreItem}
            role="menuitem"
            title="Export chat to PDF"
            disabled={isDisabled || !onExportChat}
            onClick={onExportChat}
          >
            <PdfIcon /> PDF
          </button>
        </div>
        </>
      )}
    </div>
  );
}

// ===== ICON COMPONENTS =====

// Speaker icon for text-to-speech (green when active)
function HearIcon({ active }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill={active ? "#2a7" : "#5f6368"}>
      <path d="M3 10v4a7 7 0 0 0 7 7h1a2 2 0 0 0 2-2v-5a2 2 0 0 1 2-2h1a3 3 0 1 0 0-6h-1a8 8 0 0 0-8-4H6a3 3 0 0 0-3 3v5z" />
    </svg>
  );
}

// Send message icon (arrow)
function SendIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="#5f6368">
      <path d="M120-160v-240l320-80-320-80v-240l760 320-760 320Z" />
    </svg>
  );
}

// Upload file icon
function UploadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="#5f6368">
      <path d="M19 15v4H5v-4H3v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-4h-2zM11 16h2V7l3.5 3.5 1.41-1.41L12 3.67 6.09 9.09 7.5 10.5 11 7v9z" />
    </svg>
  );
}

// Camera icon for taking photos
function CameraIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="#5f6368">
      <path d="M20 5h-3.2l-1.6-2H8.8L7.2 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-8 14a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm0-2a4 4 0 1 0 .001-8.001A4 4 0 0 0 12 17z" />
    </svg>
  );
}

// PDF export icon
function PdfIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="#5f6368">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM8 14h2a2 2 0 0 0 0-4H8v4zm0 2v2H6v-8h4a4 4 0 0 1 0 8H8zm5-6h3v2h-3v4h-2V10h2zm5 6h-2v-6h2v6zM14 3.5L18.5 8H14V3.5z" />
    </svg>
  );
}

// Microphone icon for voice input (red when recording)
function MicIcon({ active }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill={active ? "#d23" : "#5f6368"}>
      <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 14 0h-2zM11 19h2v3h-2z" />
    </svg>
  );
}

// Hamburger menu icon (3 horizontal lines)
function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="#5f6368">
      <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
    </svg>
  );
}

// Close/X icon
function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="#5f6368">
      <path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3 10.6 10.6 16.9 4.3z" />
    </svg>
  );
}
