import { Assistant as OpenAIAssistant } from "./openai";

// ChatMinds uses the same OpenAI-backed implementation as the OpenAI assistant
// and defaults to the GPT-4o mini model so it produces the same responses.
export class Assistant extends OpenAIAssistant {
  constructor(model = "gpt-4o-mini") {
    super(model);
  }
}
