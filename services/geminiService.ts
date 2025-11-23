import { GoogleGenAI } from "@google/genai";
import { getSettings } from "../utils/settingsStorage";
import { Language, IChatSession } from "../types";

// Helper to determine if the model is likely a Google native model
const isGoogleModel = (modelName: string): boolean => {
  const name = modelName.toLowerCase();
  return name.startsWith('gemini') || name.startsWith('veo') || name.startsWith('learnlm');
};

// --- Google Implementation ---

class GoogleChatSession implements IChatSession {
  private chat: any;
  
  constructor(chat: any) {
    this.chat = chat;
  }

  async sendMessage(text: string): Promise<string> {
    const result = await this.chat.sendMessage({ message: text });
    return result.text;
  }
}

// --- Groq/Generic Implementation ---

class GroqChatSession implements IChatSession {
  private apiKey: string;
  private model: string;
  private history: { role: string; content: string }[];
  private apiUrl: string = "https://api.groq.com/openai/v1/chat/completions";

  constructor(apiKey: string, model: string, systemInstruction: string) {
    this.apiKey = apiKey;
    this.model = model;
    this.history = [
      { role: "system", content: systemInstruction }
    ];
  }

  async sendMessage(text: string): Promise<string> {
    this.history.push({ role: "user", content: text });

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: this.history,
          model: this.model
        })
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`API Error (${response.status}): ${err}`);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "";
      
      this.history.push({ role: "assistant", content: reply });
      return reply;
    } catch (e) {
      console.error("Groq/OpenAI Chat Error:", e);
      throw e;
    }
  }
}

// --- Factory ---

export const createChatSession = (lang: Language = 'en'): IChatSession => {
  const settings = getSettings();
  const apiKey = settings.apiKey || process.env.API_KEY || '';
  const model = settings.model || 'gemini-3-pro-preview';
  const systemLang = lang === 'vi' ? 'Vietnamese' : 'English';
  
  const systemInstruction = `You are a helpful, expert Selenium Automation assistant. You help users write XPaths, CSS selectors, and debug automation scripts. Respond in ${systemLang}. Keep answers concise and code-focused.`;

  if (!apiKey) {
    // Return a dummy session that throws immediately if used
    return {
      sendMessage: async () => { throw new Error("API Key missing"); }
    };
  }

  if (isGoogleModel(model)) {
    const ai = new GoogleGenAI({ apiKey });
    const chat = ai.chats.create({
      model: model,
      config: { systemInstruction },
    });
    return new GoogleChatSession(chat);
  } else {
    // Assume Groq or OpenAI compatible
    return new GroqChatSession(apiKey, model, systemInstruction);
  }
};

export const generateExplanation = async (xpath: string, htmlContext: string, lang: Language = 'en'): Promise<string> => {
  const settings = getSettings();
  const apiKey = settings.apiKey || process.env.API_KEY;
  const model = settings.model || 'gemini-2.5-flash';
  
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const systemLang = lang === 'vi' ? 'Vietnamese' : 'English';
  const prompt = `
    Analyze this XPath for Selenium automation:
    XPath: \`${xpath}\`
    
    Target Element HTML:
    \`\`\`html
    ${htmlContext}
    \`\`\`
    
    Task:
    1. Assess robustness/fragility.
    2. Mention dynamic attributes or whitespace handling if relevant.
    
    Constraint:
    - Respond in ${systemLang}.
    - Keep it EXTREMELY concise (max 3 sentences).
    - Do NOT include code snippets unless absolutely necessary to explain a flaw.
    - Focus only on the 'why'.
  `;

  try {
    if (isGoogleModel(model)) {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
      });
      return response.text || (lang === 'vi' ? "Không thể tạo lời giải thích." : "No explanation generated.");
    } else {
      // Use Fetch for Groq/Generic
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          model: model
        })
      });

      if (!response.ok) throw new Error("API request failed");
      
      const data = await response.json();
      return data.choices?.[0]?.message?.content || (lang === 'vi' ? "Không thể tạo lời giải thích." : "No explanation generated.");
    }
  } catch (error) {
    console.error("AI Explanation Error:", error);
    return lang === 'vi' 
      ? "Lỗi kết nối AI. Vui lòng kiểm tra API Key và Model."
      : "Failed to generate explanation. Please check your API Key and Model settings.";
  }
};