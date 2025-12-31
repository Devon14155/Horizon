import { getAiClient, MODEL_FAST } from "../services/geminiService";

export interface ResearchResult {
  content: string;
  sources: string[];
  qualityScore: number;
}

export const executeTask = async (query: string): Promise<ResearchResult> => {
  const ai = getAiClient();

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: `
        Investigate detailed information for: ${query}. 
        Be comprehensive and cite facts.
        Evaluate the reliability of the sources you find implicitly.
      `,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const content = response.text || "No results found.";
    
    // Extract grounding metadata
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((c: any) => c.web?.uri)
      .filter((uri: string | undefined): uri is string => !!uri);

    // Simple heuristic for quality score based on source count and content length
    // Real quality control agent would analyze domain authority and cross-reference facts
    const uniqueSources = Array.from(new Set(sources)) as string[];
    let qualityScore = 70; 
    if (uniqueSources.length > 2) qualityScore += 10;
    if (content.length > 500) qualityScore += 10;
    if (content.includes("http")) qualityScore += 5;

    return { 
      content, 
      sources: uniqueSources,
      qualityScore: Math.min(100, qualityScore)
    };
  } catch (error) {
    console.error("Task execution failed", error);
    return { content: "Failed to execute research task due to API error.", sources: [], qualityScore: 0 };
  }
};