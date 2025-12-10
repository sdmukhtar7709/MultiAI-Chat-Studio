import { GoogleGenAI } from "@google/genai";

const googleai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GOOGLE_AI_API_KEY,
});

export class Assistant {
  #modelName;
  #history = [];
  #systemInstruction = "";
  name = "googleai";

  constructor(model = "gemini-2.5-flash") {
    this.#modelName = model;
  }

  createChat(history, systemInstruction = "") {
    this.#systemInstruction = systemInstruction || "";
    this.#history = history
      .filter(({ role }) => role !== "system")
      .map(({ content, role }) => ({
        role: role === "assistant" ? "model" : "user",
        parts: [{ text: content }],
      }));
  }

  async chat(content) {
    const userMessage = this.#composeMessage(content);
    const contents = this.#buildContents(userMessage);

    try {
      const result = await googleai.models.generateContent({
        model: this.#modelName,
        contents,
      });

      const text = this.#extractText(result);
      this.#updateHistory(userMessage, text);
      return text;
    } catch (error) {
      throw this.#parseError(error);
    }
  }

  async *chatStream(content) {
    const userMessage = this.#composeMessage(content);
    const contents = this.#buildContents(userMessage);
    let combinedText = "";

    try {
      const result = await googleai.models.generateContentStream({
        model: this.#modelName,
        contents,
      });

      for await (const chunk of result.stream) {
        const text = this.#extractText(chunk);
        combinedText += text;
        if (text) {
          yield text;
        }
      }

      this.#updateHistory(userMessage, combinedText);
    } catch (error) {
      throw this.#parseError(error);
    }
  }

  #buildContents(userMessage) {
    const contents = [...this.#history, userMessage];
    if (this.#systemInstruction) {
      contents.unshift({
        role: "system",
        parts: [{ text: this.#systemInstruction }],
      });
    }
    return contents;
  }

  #composeMessage(content) {
    // If an object with image data is provided, construct multimodal parts
    if (content && typeof content === "object" && content.imageDataUrl) {
      const parts = [];
      if (content.text) {
        parts.push({ text: content.text });
      }
      const { mimeType, base64 } = this.#parseDataUrl(content.imageDataUrl);
      parts.push({ inlineData: { mimeType, data: base64 } });
      return { role: "user", parts };
    }

    // Fallback to plain text for normal messages
    return {
      role: "user",
      parts: [{ text: content ?? "" }],
    };
  }

  #extractText(result) {
    const direct = result?.text;
    const textProp = typeof direct === "function" ? direct() : direct;

    const responseText =
      typeof result?.response?.text === "function"
        ? result.response.text()
        : result?.response?.text;

    const candidateText = result?.response?.candidates
      ?.map((candidate) =>
        candidate?.content?.parts
          ?.map((part) => part?.text || "")
          .join("")
          .trim()
      )
      .filter(Boolean)
      .join("\n");

    return responseText || textProp || candidateText || "";
  }

  #updateHistory(userMessage, assistantText) {
    this.#history.push(userMessage);
    this.#history.push({ role: "model", parts: [{ text: assistantText }] });
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
