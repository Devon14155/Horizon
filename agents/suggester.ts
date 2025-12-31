import { Type, GenerateContentResponse } from "@google/genai";
import { getAiClient, MODEL_FAST } from "../services/geminiService";
import { withRetry, cleanJson } from "../utils/retry";

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
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
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
    }));
    
    const data = JSON.parse(cleanJson(response.text || "{}"));
    return data.suggestions || [];
  } catch (error) {
    console.warn("Suggestion Agent failed, using heuristic fallback.", error);
    
    // Heuristic Fallback Logic
    const fallbacks: string[] = [];
    const lowerContext = context.toLowerCase();

    // Context-aware additions
    if (lowerContext.includes("trend") || lowerContext.includes("future")) {
        fallbacks.push("What are the long-term implications?");
    }
    if (lowerContext.includes("cost") || lowerContext.includes("economic") || lowerContext.includes("price")) {
        fallbacks.push("Is there a cost-benefit analysis?");
    }
    if (lowerContext.includes("problem") || lowerContext.includes("issue") || lowerContext.includes("challenge")) {
        fallbacks.push("What are the proposed solutions?");
    }
    if (lowerContext.includes("technology") || lowerContext.includes("algorithm") || lowerContext.includes("system")) {
        fallbacks.push("How does this compare to alternatives?");
    }

    // Standard research follow-ups to fill the quota
    const defaults = [
        "Identify potential biases in this research", 
        "What are the key counter-arguments?", 
        "Find more recent statistical data",
        "Generate a detailed PDF report"
    ];

    // Merge and deduplicate
    for (const def of defaults) {
        if (fallbacks.length < 3) {
            fallbacks.push(def);
        }
    }

    return fallbacks.slice(0, 3);
  }
};