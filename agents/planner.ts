import { Type } from "@google/genai";
import { getAiClient, MODEL_REASONING } from "../services/geminiService";
import { UserSettings } from "../types";
import { personalizePrompt } from "./personalization";

export interface PlanResult {
  tasks: { title: string; description: string; query: string }[];
}

export const planResearch = async (goal: string, context: string, settings: UserSettings): Promise<PlanResult> => {
  const ai = getAiClient();

  const basePrompt = `
    You are an expert Task Planner Agent. 
    User Goal: "${goal}"
    Context: "${context}"
    
    Break this research goal into 3-6 distinct, execution-ready research tasks. 
    Each task must have a specific search query optimized for a search engine.
    Order them logically to build up knowledge.
  `;

  const prompt = personalizePrompt(basePrompt, settings);

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