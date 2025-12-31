import { Type, GenerateContentResponse } from "@google/genai";
import { getAiClient, MODEL_FAST } from "../services/geminiService";
import { withRetry } from "../utils/retry";

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
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
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
    }));

    const text = response.text || "{}";
    const result = JSON.parse(text);
    return {
        score: result.score || 50,
        issues: result.issues || [],
        isAcceptable: result.isAcceptable ?? true
    };
  } catch (error) {
    console.warn("QC Agent failed, using heuristic fallback.", error);

    // Robust Heuristic Calculation
    // 1. Length Score: Up to 50 points (approx 1 point per 50 chars, maxing at 2500 chars)
    const lengthScore = Math.min(Math.floor(content.length / 50), 50);
    
    // 2. Source Score: Up to 50 points (10 points per source, maxing at 5 sources)
    const sourceScore = Math.min(sources.length * 10, 50);
    
    const totalScore = lengthScore + sourceScore;
    
    // Determine acceptability (Threshold: 40)
    // Example: 2 sources (20pts) + 1000 chars (20pts) = 40 (Pass)
    const isAcceptable = totalScore >= 40;

    return { 
        score: totalScore, 
        issues: ["Automated QC failed. Score calculated via heuristic (Length + Sources)."], 
        isAcceptable: isAcceptable 
    };
  }
};