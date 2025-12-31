import { Type, GenerationConfig } from "@google/genai";
import { getAiClient, MODEL_REASONING } from "../services/geminiService";
import { UserSettings, ToolMode } from "../types";
import { personalizePrompt } from "./personalization";

export interface PlanResult {
  tasks: { title: string; description: string; query: string }[];
}

export const planResearch = async (
    goal: string, 
    context: string, 
    settings: UserSettings, 
    toolMode: ToolMode = 'web'
): Promise<PlanResult> => {
  const ai = getAiClient();

  // Adjust prompt based on tool mode
  const taskInstruction = toolMode === 'web'
    ? `Create exactly 1 comprehensive, broad search task that covers the key aspects of the user's goal.`
    : `Break this research goal into 3-6 distinct, execution-ready research tasks. Order them logically to build up knowledge.`;

  const basePrompt = `
    You are an expert Task Planner Agent. 
    User Goal: "${goal}"
    Context: "${context}"
    Mode: ${toolMode.toUpperCase()}
    
    ${taskInstruction}
    Each task must have a specific search query optimized for a search engine.
  `;

  const prompt = personalizePrompt(basePrompt, settings);

  const config: GenerationConfig = {
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
  };

  // Enable thinking if requested
  if (toolMode === 'thinking') {
    config.thinkingConfig = { thinkingBudget: 2048 };
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_REASONING,
      contents: prompt,
      config: config
    });
    
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Planning failed", error);
    throw error;
  }
};