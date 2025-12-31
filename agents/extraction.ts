import { Type } from "@google/genai";
import { getAiClient, MODEL_FAST } from "../services/geminiService";

export const extractKeyData = async (content: string): Promise<Record<string, any>> => {
  const ai = getAiClient();
  
  const prompt = `
    Extract key entities and structured data from this text.
    Focus on dates, definitions, statistics, and people.
    Text: "${content.substring(0, 1000)}..."
  `;

  try {
    const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt,
        config: {
            responseMimeType: "application/json"
        }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
      return {};
  }
};