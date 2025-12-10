import { Assistant as OpenAIAssistant } from "./openai";

// ChatMinds uses OpenAI GPT-4o-mini
export class Assistant extends OpenAIAssistant {
  constructor(model = "gpt-4o-mini") {
    super(model);
  }
}
