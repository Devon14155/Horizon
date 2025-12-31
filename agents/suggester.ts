import { Type } from "@google/genai";
import { getAiClient, MODEL_FAST } from "../services/geminiService";

export const generateSuggestions = async (context: string): Promise<string[]> => {
  const ai = getAiClient();

  const prompt = `
    Based on this research context, suggest 3 short, relevant follow-up questions or actions for the user.
    Context: "${context.substring(0, 500)}..."
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });
    
    const data = JSON.parse(response.text || "{}");
    return data.suggestions || [];
  } catch (error) {
    return [];
  }
};