import Anthropic from "@anthropic-ai/sdk";

const getAnthropicClient = () => {
  const apiKey = typeof import.meta !== "undefined" ? import.meta.env?.VITE_ANTHROPIC_AI_API_KEY : undefined;

  if (!apiKey) {
    return null;
  }

  return new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
};

export class Assistant {
  #client;
  #model;

  constructor(model = "claude-3-5-haiku-latest", client = getAnthropicClient()) {
    this.#client = client;
    this.#model = model;
  }

  #ensureClient() {
    if (!this.#client) {
      throw new Error("Anthropic is not configured. Add VITE_ANTHROPIC_AI_API_KEY to your .env file.");
    }
    return this.#client;
  }

  async chat(content, history) {
    const client = this.#ensureClient();
    try {
      const { system, filteredHistory } = this.#extractSystem(history);
      const result = await client.messages.create({
        model: this.#model,
        system: system || undefined,
        messages: [...filteredHistory, this.#buildUserMessage(content)],
        max_tokens: 1024,
      });

      return result.content[0].text;
    } catch (error) {
      throw this.#parseError(error);
    }
  }

  async *chatStream(content, history) {
    const client = this.#ensureClient();
    try {
      const { system, filteredHistory } = this.#extractSystem(history);
      const result = await client.messages.create({
        model: this.#model,
        system: system || undefined,
        messages: [...filteredHistory, this.#buildUserMessage(content)],
        max_tokens: 1024,
        stream: true,
      });

      for await (const chunk of result) {
        if (chunk.type === "content_block_delta") {
          yield chunk.delta.text || "";
        }
      }
    } catch (error) {
      throw this.#parseError(error);
    }
  }

  #parseError(error) {
    try {
      return error.error.error;
    } catch (parseError) {
      return error;
    }
  }

  #extractSystem(history = []) {
    let system = "";
    const filteredHistory = [];
    for (const msg of history || []) {
      if (msg?.role === "system" && !system) {
        system = msg.content || "";
      } else {
        filteredHistory.push(msg);
      }
    }
    return { system, filteredHistory };
  }

  #buildUserMessage(content) {
    if (content && typeof content === "object" && content.imageDataUrl) {
      const { mediaType, base64 } = this.#parseDataUrl(content.imageDataUrl);
      const blocks = [];
      if (content.text) blocks.push({ type: "text", text: content.text });
      blocks.push({
        type: "image",
        source: { type: "base64", media_type: mediaType, data: base64 },
      });
      return { role: "user", content: blocks };
    }
    return { role: "user", content: typeof content === "string" ? content : "" };
  }

  #parseDataUrl(dataUrl) {
    const match = /^data:(.+);base64,(.+)$/.exec(dataUrl || "");
    return {
      mediaType: match?.[1] || "image/png",
      base64: match?.[2] || "",
    };
  }
}
