import { getAiClient, MODEL_FAST } from "../services/geminiService";

export const formatReport = async (synthesis: string, format: 'academic' | 'business' | 'simple'): Promise<string> => {
  const ai = getAiClient();
  
  const prompt = `
    Rewrite the following research synthesis into a ${format} report format.
    
    If Academic: Use formal tone, strict sections (Abstract, Introduction, Body, Conclusion).
    If Business: Use executive tone, bullet points, strategic implications.
    If Simple: Use plain language, ELI5 style.
    
    Content:
    ${synthesis}
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt
    });

    return response.text || synthesis;
  } catch (error) {
    return synthesis; // Fallback to original
  }
};