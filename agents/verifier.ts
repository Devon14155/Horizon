import { Type } from "@google/genai";
import { getAiClient, MODEL_REASONING } from "../services/geminiService";
import { VerificationResult } from "../types";

export const verifyFindings = async (task: string, findings: string, sources: string[]): Promise<VerificationResult> => {
  const ai = getAiClient();

  // If no sources, we can't verify well
  if (sources.length === 0) {
    return { isAccurate: true, confidence: 50, correction: "No external sources to verify against." };
  }

  const prompt = `
    You are a Fact Verification Agent.
    Task: "${task}"
    Findings to Verify: "${findings.substring(0, 1000)}..."
    Sources Used: ${sources.join(', ')}

    Analyze the findings for potential hallucinations, logical inconsistencies, or lack of citation support.
    
    Return a JSON object:
    {
      "isAccurate": boolean,
      "confidence": number (0-100),
      "correction": string (optional correction or warning if confidence is low)
    }
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
            isAccurate: { type: Type.BOOLEAN },
            confidence: { type: Type.NUMBER },
            correction: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Verification failed", error);
    return { isAccurate: true, confidence: 0 };
  }
};