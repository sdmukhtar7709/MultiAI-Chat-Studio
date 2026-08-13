import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Assistant as GoogleAIAssistant } from "../../assistants/googleai";
import { Assistant as OpenAIAssistant } from "../../assistants/openai";
import { Assistant as DeepSeekAIAssistant } from "../../assistants/deepseekai";
import { Assistant as GroqAssistant } from "../../assistants/groq";
import { Assistant as AnthropicAIAssistant } from "../../assistants/anthropicai";
import { Assistant as XAIAssistant } from "../../assistants/xai";
import { Assistant as ChatMindsAssistant } from "../../assistants/chatminds";
import { Assistant as LMStudioAssistant } from "../../assistants/lmstudio";
import styles from "./Assistant.module.css";

const assistantMap = {
  googleai: GoogleAIAssistant,
  openai: OpenAIAssistant,
  deepseekai: DeepSeekAIAssistant,
  groq: GroqAssistant,
  anthropicai: AnthropicAIAssistant,
  xai: XAIAssistant,
  chatminds: ChatMindsAssistant,
  lmstudio: LMStudioAssistant,
};

export function Assistant({ onAssistantChange }) {
  const [value, setValue] = useState("chatminds:gpt-4o-mini");

  function handleValueChange(event) {
    setValue(event.target.value);
  }

  useEffect(() => {
    const colonIndex = value.indexOf(":");
    const assistant = value.substring(0, colonIndex);
    const model = value.substring(colonIndex + 1);
    const AssistantClass = assistantMap[assistant];

    if (!AssistantClass) {
      throw new Error(`Unknown assistant: ${assistant} or model: ${model}`);
    }

    onAssistantChange(new AssistantClass(model));
  }, [value, onAssistantChange]);

  return (
    <div className={styles.Assistant}>
      <span>Assistant:</span>
      <select defaultValue={value} onChange={handleValueChange} aria-label="Model selector">
        <optgroup label="ChatMinds">
          <option value="chatminds:gpt-4o-mini">ChatMinds</option>
        </optgroup>

        <optgroup label="Open AI">
          <option value="openai:gpt-4o-mini">GPT-4o mini</option>
          <option value="openai:chatgpt-4o-latest">ChatGPT-4o</option>
        </optgroup>

        <optgroup label="Google AI">
          <option value="googleai:gemini-2.0-flash">Gemini 2.0 Flash</option>
          <option value="googleai:gemini-2.5-flash">Gemini 2.5 Flash</option>
          <option value="googleai:gemini-2.0-flash-lite">
            Gemini 2.0 Flash-Lite
          </option>
        </optgroup>

        <optgroup label="DeepSeek AI">
          <option value="deepseekai:deepseek-chat">DeepSeek-V3</option>
        </optgroup>

        <optgroup label="Groq">
          <option value="groq:meta-llama/llama-4-maverick-17b-128e-instruct">
            Llama 4 Maverick 17B
          </option>
        </optgroup>

        <optgroup label="Anthropic AI">
          <option value="anthropicai:claude-3-5-haiku-latest">
            Claude 3.5 Haiku
          </option>
        </optgroup>

        <optgroup label="X AI">
          <option value="xai:grok-3-mini-latest">Grok 3 Mini</option>
        </optgroup>

        <optgroup label="LM Studio (Local)">
          <option value="lmstudio:qwen2.5-sex">Qwen 2.5 (Local)</option>
        </optgroup>
      </select>
    </div>
  );
}

Assistant.propTypes = {
  onAssistantChange: PropTypes.func.isRequired,
};
