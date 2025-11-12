import { GoogleGenAI } from "@google/genai";

const googleai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GOOGLE_AI_API_KEY,
});

export class Assistant {
  #chat;
  #systemInstruction = "";
  name = "googleai";

  constructor(model = "gemini-2.0-flash") {
    this.#chat = googleai.chats.create({ model });
  }
  createChat(history, systemInstruction = "") {
    this.#systemInstruction = systemInstruction || "";
    this.#chat = googleai.chats.create({
      model: this.#chat.model,
      history: history
        .filter(({ role }) => role !== "system")
        .map(({ content, role }) => ({
          parts: [{ text: content }],
          role: role === "assistant" ? "model" : role,
        })),
    });
  }

  async chat(content) {
    try {
      const result = await this.#chat.sendMessage({
        message: this.#composeMessage(content),
      });
      return result.text;
    } catch (error) {
      throw this.#parseError(error);
    }
  }

  async *chatStream(content) {
    try {
      const result = await this.#chat.sendMessageStream({
        message: this.#composeMessage(content),
      });

      for await (const chunk of result) {
        yield chunk.text;
      }
    } catch (error) {
      throw this.#parseError(error);
    }
  }

  #composeContent(content) {
    return this.#systemInstruction
      ? `${this.#systemInstruction}\n\n${content}`
      : content;
  }

  #composeMessage(content) {
    // If an object with image data is provided, construct multimodal parts
    if (content && typeof content === "object" && content.imageDataUrl) {
      const parts = [];
      if (this.#systemInstruction) {
        parts.push({ text: this.#systemInstruction });
      }
      if (content.text) {
        parts.push({ text: content.text });
      }
  const { mimeType, base64 } = this.#parseDataUrl(content.imageDataUrl);
  parts.push({ inlineData: { mimeType, data: base64 } });
  return { role: "user", parts };
    }

    // Fallback to plain text (with system prefix) for normal messages
    return this.#composeContent(content ?? "");
  }

  #parseDataUrl(dataUrl) {
    const match = /^data:(.+);base64,(.+)$/.exec(dataUrl || "");
    return {
      mimeType: match?.[1] || "image/png",
      base64: match?.[2] || "",
    };
  }

  #parseError(error) {
    try {
      // Extract and parse the outer error JSON from the message string
      const [, outerErrorJSON] = error?.message?.split(" . ");
      const outerErrorObject = JSON.parse(outerErrorJSON);

      // Parse the nested stringified JSON from the outer error
      const innerErrorObject = JSON.parse(outerErrorObject?.error?.message);

      return innerErrorObject?.error;
    } catch (parseError) {
      return error;
    }
  }
}
