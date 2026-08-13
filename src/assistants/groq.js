import Groq from "groq-sdk";
import { Assistant as OpenAIAssistant } from "../assistants/openai";

const getGroqClient = () => {
  const apiKey = typeof import.meta !== "undefined" ? import.meta.env?.VITE_GROQ_API_KEY : undefined;

  if (!apiKey) {
    return null;
  }

  return new Groq({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
};

export class Assistant extends OpenAIAssistant {
  constructor(
    model = "meta-llama/llama-4-maverick-17b-128e-instruct",
    client = getGroqClient()
  ) {
    super(model, client);
  }
}
