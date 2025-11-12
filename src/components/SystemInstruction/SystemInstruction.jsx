import { useEffect, useState } from "react";
import styles from "./SystemInstruction.module.css";

export function SystemInstruction({ value = "", onChange }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    // Keep draft synced when parent value changes from elsewhere
    if (!open) setDraft(value);
  }, [value, open]);

  function handleOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    setDraft(value); // reset unsaved
  }

  function handleSave() {
    onChange?.(draft);
    setOpen(false);
  }

  return (
    <div className={styles.SystemInstruction}>
      <button className={styles.ToggleButton} onClick={handleOpen}>
        System Instruction
      </button>

      {open && (
        <>
          <div className={styles.Overlay} onClick={handleClose} />
          <div className={styles.Panel} role="dialog" aria-modal="true">
            <h3 style={{ margin: 0 }}>Edit system instruction</h3>
            <textarea
              className={styles.TextArea}
              placeholder="E.g., You are a helpful assistant. Be concise and use markdown."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <div className={styles.Actions}>
              <button className={styles.Button} onClick={handleClose}>Cancel</button>
              <button className={styles.Button} data-variant="primary" onClick={handleSave}>
                Save & Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
