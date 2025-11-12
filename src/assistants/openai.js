import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPEN_AI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export class Assistant {
  #client;
  #model;

  constructor(model = "gpt-4o-mini", client = openai) {
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
