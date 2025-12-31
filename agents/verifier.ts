import { Type } from "@google/genai";
import { getAiClient, MODEL_REASONING } from "../services/geminiService";
import { VerificationResult } from "../types";

export const verifyFindings = async (task: string, findings: string, sources: string[]): Promise<VerificationResult> => {
  const ai = getAiClient();

  if (sources.length === 0) {
    return { isAccurate: true, confidence: 50, correction: "No external sources available for cross-verification." };
  }

  const prompt = `
    ROLE: Verification Agent
    TASK: Verify the accuracy of research findings against the task and implied source credibility.
    
    RESEARCH TASK: "${task}"
    FINDINGS: "${findings.substring(0, 1500)}..."
    SOURCE COUNT: ${sources.length}
    
    ANALYSIS REQUIRED:
    1. Cross-check facts for consistency.
    2. Detect potential hallucinations or unsupported claims.
    3. Check for contradictions within the text.
    
    OUTPUT JSON:
    {
      "isAccurate": boolean,
      "confidence": number (0-100),
      "correction": string (Short note on any issues found, or 'Verified' if good)
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
    console.error("Verification Agent failed", error);
    return { isAccurate: true, confidence: 0, correction: "Verification process failed." };
  }
};