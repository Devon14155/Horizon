import { Type, GenerateContentResponse } from "@google/genai";
import { getAiClient, MODEL_FAST } from "../services/geminiService";
import { withRetry } from "../utils/retry";

export interface ChartData {
  title: string;
  type: 'bar' | 'pie' | 'line';
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

export const generateChartData = async (context: string): Promise<ChartData | null> => {
  const ai = getAiClient();
  
  // Only attempt to generate a chart if there seem to be numbers in the text
  if (!/\d+/.test(context)) return null;

  const prompt = `
    Analyze the following research text. If it contains statistical data suitable for a chart (bar, pie, or line), 
    extract it into a JSON structure. If no suitable data exists, return null.
    
    Text: "${context.substring(0, 2000)}..."
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
            title: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['bar', 'pie', 'line'] },
            labels: { type: Type.ARRAY, items: { type: Type.STRING } },
            datasets: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  data: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                }
              }
            }
          }
        }
      }
    }));

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.warn("Failed to generate chart data", error);
    return null;
  }
};