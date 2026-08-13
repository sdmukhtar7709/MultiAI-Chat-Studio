import OpenAI from "openai";
import { Assistant as OpenAIAssistant } from "../assistants/openai";

const getDeepSeekClient = () => {
  const apiKey = typeof import.meta !== "undefined" ? import.meta.env?.VITE_DEEPSEEK_AI_API_KEY : undefined;

  if (!apiKey) {
    return null;
  }

  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    dangerouslyAllowBrowser: true,
  });
};

export class Assistant extends OpenAIAssistant {
  constructor(model = "deepseek-chat", client = getDeepSeekClient()) {
    super(model, client);
  }
}
