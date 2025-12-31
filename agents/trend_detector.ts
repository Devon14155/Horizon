import { getAiClient, MODEL_REASONING } from "../services/geminiService";

export const detectTrends = async (findings: string[]): Promise<string> => {
  if (findings.length < 2) return "";
  
  const ai = getAiClient();
  const context = findings.map((f, i) => `Finding ${i+1}: ${f.substring(0, 300)}`).join('\n');

  const prompt = `
    Analyze these research findings. 
    Identify 2-3 emerging trends, recurring patterns, or contradictions across the sources.
    Return a brief bulleted list.
    
    Data:
    ${context}
  `;

  try {
    const response = await ai.models.generateContent({
        model: MODEL_REASONING,
        contents: prompt
    });
    return response.text || "";
  } catch (e) {
      return "";
  }
};