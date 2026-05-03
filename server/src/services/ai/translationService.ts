import axios from 'axios';

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434/api/generate";
const LIBRE_URL = process.env.LIBRE_URL || "http://localhost:5000/translate";

/**
 * Translate using local Ollama (Aya Expanse)
 */
export const translateWithOllama = async (text: string): Promise<string> => {
  try {
    const prompt = `Translate the following movie subtitle lines into natural, cinematic Modern Standard Arabic (الفصحى). 
Keep all timestamps and formatting exactly as they are. 
Translate character names and sound effects appropriately. 
Arabic text must be Right-to-Left (RTL) friendly. 
Do not add any explanations or extra text.

Text:
${text}`;

    const response = await axios.post(OLLAMA_URL, {
      model: "aya-expanse:8b",
      prompt: prompt,
      stream: false
    });

    return response.data.response.trim();
  } catch (error) {
    console.error("Ollama translation error:", error);
    throw error;
  }
};

/**
 * Translate using self-hosted LibreTranslate (Fallback 1)
 */
export const translateWithLibre = async (text: string): Promise<string> => {
  try {
    const response = await axios.post(LIBRE_URL, {
      q: text,
      source: "en",
      target: "ar",
      format: "text"
    });
    return response.data.translatedText;
  } catch (error) {
    console.error("LibreTranslate error:", error);
    throw error;
  }
};
