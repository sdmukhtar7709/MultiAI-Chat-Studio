import Groq from "groq-sdk";
import { Assistant as OpenAIAssistant } from "../assistants/openai";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export class Assistant extends OpenAIAssistant {
  constructor(
    model = "meta-llama/llama-4-maverick-17b-128e-instruct",
    client = groq
  ) {
    super(model, client);
  }
}
