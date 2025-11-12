import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_AI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export class Assistant {
  #client;
  #model;

  constructor(model = "claude-3-5-haiku-latest", client = anthropic) {
    this.#client = client;
    this.#model = model;
  }

  async chat(content, history) {
    try {
      const { system, filteredHistory } = this.#extractSystem(history);
      const result = await this.#client.messages.create({
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
    try {
      const { system, filteredHistory } = this.#extractSystem(history);
      const result = await this.#client.messages.create({
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
