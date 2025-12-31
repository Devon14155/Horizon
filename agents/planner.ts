import { Type } from "@google/genai";
import { getAiClient, MODEL_REASONING } from "../services/geminiService";

export interface PlanResult {
  tasks: { title: string; description: string; query: string }[];
}

export const planResearch = async (goal: string): Promise<PlanResult> => {
  const ai = getAiClient();

  const prompt = `
    You are an expert Research Planner Agent. 
    User Goal: "${goal}"
    
    Break this research goal into 3-5 distinct, execution-ready research tasks. 
    Each task must have a specific search query optimized for a search engine.
    Order them logically to build up knowledge.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_REASONING,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  query: { type: Type.STRING, description: "Optimized Google Search query" }
                }
              }
            }
          }
        }
      }
    });
    
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Planning failed", error);
    throw error;
  }
};