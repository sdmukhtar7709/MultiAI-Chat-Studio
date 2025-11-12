import OpenAI from "openai";
import { Assistant as OpenAIAssistant } from "../assistants/openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: import.meta.env.VITE_DEEPSEEK_AI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export class Assistant extends OpenAIAssistant {
  constructor(model = "deepseek-chat", client = openai) {
    super(model, client);
  }
}
