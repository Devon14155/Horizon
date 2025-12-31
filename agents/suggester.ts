import { Type } from "@google/genai";
import { getAiClient, MODEL_FAST } from "../services/geminiService";

export const generateSuggestions = async (context: string): Promise<string[]> => {
  const ai = getAiClient();

  const prompt = `
    ROLE: Suggestion Agent
    TASK: Predict the user's next 3 most likely research steps or questions based on the findings.
    
    CONTEXT (Research Findings): 
    "${context.substring(0, 1000)}..."
    
    REQUIREMENTS:
    - Suggestions must be actionable.
    - Suggestions must dive deeper or explore related tangents.
    - Max 10 words per suggestion.
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
    // Fallback suggestions
    return ["Tell me more about the key trends", "Explain the technical details", "Generate a PDF report"];
  }
};