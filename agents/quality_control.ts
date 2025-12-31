import { Type } from "@google/genai";
import { getAiClient, MODEL_FAST } from "../services/geminiService";

export interface QualityResult {
  score: number;
  issues: string[];
  isAcceptable: boolean;
}

export const evaluateQuality = async (content: string, sources: string[]): Promise<QualityResult> => {
  const ai = getAiClient();
  
  // Heuristic check for empty content
  if (!content || content.length < 50) {
    return { score: 0, issues: ["Content too short"], isAcceptable: false };
  }

  const prompt = `
    Analyze the quality of this research snippet.
    Source Count: ${sources.length}
    Content Length: ${content.length}
    Content Preview: "${content.substring(0, 500)}..."

    Rate on 0-100 scale. 
    Criteria: 
    - Factual density
    - Relevance
    - Source support (implicit)
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
            score: { type: Type.NUMBER },
            issues: { type: Type.ARRAY, items: { type: Type.STRING } },
            isAcceptable: { type: Type.BOOLEAN }
          }
        }
      }
    });

    const text = response.text || "{}";
    const result = JSON.parse(text);
    return {
        score: result.score || 50,
        issues: result.issues || [],
        isAcceptable: result.isAcceptable ?? true
    };
  } catch (error) {
    // Fallback heuristic
    return { 
        score: sources.length * 20, 
        issues: ["Automated QC failed, using heuristic"], 
        isAcceptable: true 
    };
  }
};