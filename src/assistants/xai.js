import OpenAI from "openai";
import { Assistant as OpenAIAssistant } from "../assistants/openai";

const getXAIClient = () => {
  const apiKey = typeof import.meta !== "undefined" ? import.meta.env?.VITE_X_AI_API_KEY : undefined;

  if (!apiKey) {
    return null;
  }

  return new OpenAI({
    baseURL: "https://api.x.ai/v1",
    apiKey,
    dangerouslyAllowBrowser: true,
  });
};

export class Assistant extends OpenAIAssistant {
  constructor(model = "grok-3-mini-latest", client = getXAIClient()) {
    super(model, client);
  }
}
