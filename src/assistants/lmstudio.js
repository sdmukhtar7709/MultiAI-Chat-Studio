import OpenAI from "openai";

// LM Studio runs a local OpenAI-compatible API server
// Your LM Studio server endpoint
const lmstudio = new OpenAI({
  baseURL: "http://localhost:1234/v1",
  apiKey: "lm-studio", // LM Studio doesn't require a real API key
  dangerouslyAllowBrowser: true,
});

export class Assistant {
  #client;
  #model;

  constructor(model = "qwen2.5-sex", client = lmstudio) {
    this.#client = client;
    this.#model = model;
  }

  async chat(content, history) {
    try {
      const result = await this.#client.chat.completions.create({
        model: this.#model,
        messages: [...history, this.#buildUserMessage(content)],
      });

      return result.choices[0].message.content;
    } catch (error) {
      throw this.#parseError(error);
    }
  }

  async *chatStream(content, history) {
    try {
      const result = await this.#client.chat.completions.create({
        model: this.#model,
        messages: [...history, this.#buildUserMessage(content)],
        stream: true,
      });

      for await (const chunk of result) {
        yield chunk.choices[0]?.delta?.content || "";
      }
    } catch (error) {
      throw this.#parseError(error);
    }
  }

  #parseError(error) {
    if (error.message?.includes("Failed to fetch") || error.message?.includes("ECONNREFUSED")) {
      return new Error("Cannot connect to LM Studio. Make sure LM Studio is running and the local server is started on port 1234.");
    }
    return error;
  }

  #buildUserMessage(content) {
    if (content && typeof content === "object" && content.imageDataUrl) {
      const parts = [];
      if (content.text) {
        parts.push({ type: "text", text: content.text });
      }
      parts.push({ type: "image_url", image_url: { url: content.imageDataUrl } });
      return { role: "user", content: parts };
    }

    return { role: "user", content: typeof content === "string" ? content : "" };
  }
}
