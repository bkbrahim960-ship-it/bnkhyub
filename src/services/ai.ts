import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchMulti } from "./tmdb";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface AIMessage {
  role: "user" | "model";
  content: string;
  recommendations?: any[];
}

export const getAIRecommendations = async (prompt: string, lang: string): Promise<AIMessage> => {
  if (!API_KEY) {
    throw new Error("Gemini API key is missing");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const systemPrompt = `You are a helpful AI movie and TV show recommendation assistant for a streaming platform called BNKhub.
The user is speaking in ${lang === "ar" ? "Arabic" : "French"}.
Analyze their request: "${prompt}".

You MUST return your response as a valid JSON object with EXACTLY this structure:
{
  "reply": "Your friendly text response to the user, explaining why you chose these recommendations.",
  "items": [
    { "title": "Movie or Show Name", "type": "movie" | "tv", "year": "YYYY" }
  ]
}

- Provide 3 to 5 recommendations.
- DO NOT wrap the JSON in markdown code blocks. Just return the raw JSON object.
`;

  try {
    const result = await model.generateContent(systemPrompt);
    let text = result.response.text().trim();
    
    if (text.startsWith("\`\`\`json")) text = text.replace(/\`\`\`json/g, "");
    if (text.startsWith("\`\`\`")) text = text.replace(/\`\`\`/g, "");
    if (text.endsWith("\`\`\`")) text = text.replace(/\`\`\`/g, "");
    text = text.trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse AI JSON", text);
      return { role: "model", content: lang === "ar" ? "عذراً، لم أتمكن من فهم الطلب جيداً. هل يمكنك إعادة صياغته؟" : "Désolé, je n'ai pas pu bien comprendre votre demande. Pouvez-vous reformuler ?" };
    }

    const recommendations = [];
    for (const item of parsed.items || []) {
      const tmdbRes = await searchMulti(item.title, lang);
      // Try to find the exact type, or fallback to first result
      const match = tmdbRes.results.find((r: any) => (r.media_type === item.type || !r.media_type) && r.poster_path) || tmdbRes.results.find((r: any) => r.poster_path) || tmdbRes.results[0];
      if (match) {
        recommendations.push({ ...match, media_type: match.media_type || item.type });
      }
    }

    return {
      role: "model",
      content: parsed.reply,
      recommendations,
    };
  } catch (error) {
    console.error("AI Error:", error);
    return {
      role: "model",
      content: lang === "ar" ? "عذراً، حدث خطأ أثناء الاتصال بالذكاء الاصطناعي." : "Désolé, une erreur s'est produite lors de la connexion à l'IA."
    };
  }
};
