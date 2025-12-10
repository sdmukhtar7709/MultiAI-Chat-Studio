import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./SystemInstruction.module.css";

/**
 * SystemInstruction Component
 * 
 * Allows users to set a "system prompt" that controls AI behavior.
 * The system instruction is sent as the first message to the AI
 * and tells it how to behave (personality, rules, name, etc.)
 * 
 * @param {string} value - Current system instruction text
 * @param {function} onChange - Callback when instruction is saved
 */
export function SystemInstruction({ value = "", onChange }) {
  // Modal open/closed state
  const [open, setOpen] = useState(false);
  // Temporary draft while editing (not saved until user clicks Save)
  const [draft, setDraft] = useState(value);

  // Sync draft with parent value when modal is closed
  useEffect(() => {
    if (!open) setDraft(value);
  }, [value, open]);

  // Open the modal dialog
  function handleOpen() {
    setOpen(true);
  }

  // Cancel editing - discard changes and close modal
  function handleClose() {
    setOpen(false);
    setDraft(value); // Reset to original value
  }

  // Save changes - update parent state and close modal
  function handleSave() {
    onChange?.(draft); // Send new value to App.jsx
    setOpen(false);
  }

  return (
    <div className={styles.SystemInstruction}>
      {/* Button to open the system instruction editor */}
      <button className={styles.ToggleButton} onClick={handleOpen}>
        System Instruction
      </button>

      {/* Modal dialog - rendered at document.body using createPortal */}
      {open && typeof document !== "undefined" &&
        createPortal(
          <>
            {/* Dark overlay behind modal - click to close */}
            <div className={styles.Overlay} onClick={handleClose} />
            
            {/* Modal panel with textarea and buttons */}
            <div className={styles.Panel} role="dialog" aria-modal="true">
              <h3 style={{ margin: 0 }}>Edit system instruction</h3>
              
              {/* Textarea for editing the instruction */}
              <textarea
                className={styles.TextArea}
                placeholder="E.g., You are a helpful assistant. Be concise and use markdown."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              
              {/* Action buttons */}
              <div className={styles.Actions}>
                <button className={styles.Button} onClick={handleClose}>Cancel</button>
                <button className={styles.Button} data-variant="primary" onClick={handleSave}>
                  Save & Close
                </button>
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
