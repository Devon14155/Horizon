import { getAiClient, MODEL_FAST } from "../services/geminiService";

export const translateContent = async (content: string, targetLanguage: string): Promise<string> => {
  if (targetLanguage === 'en' || !targetLanguage) return content;

  const ai = getAiClient();
  const prompt = `Translate the following text to ${targetLanguage}. Maintain formatting.\n\n${content}`;

  try {
    const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt
    });
    return response.text || content;
  } catch (e) {
      return content;
  }
};