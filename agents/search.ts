import { getAiClient, MODEL_FAST } from "../services/geminiService";
import { RetryAgent } from "./retry_recovery";

export interface SearchResult {
  content: string;
  sources: string[];
  rankingScore?: number;
}

export const executeSearch = async (query: string): Promise<SearchResult> => {
  const ai = getAiClient();

  // Orchestrate the search using Gemini's grounding
  // This acts as the "Multi-source search orchestration"
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: `
        ROLE: Search Agent
        TASK: Investigate the query: "${query}"
        
        INSTRUCTIONS:
        1. Find detailed, factual information.
        2. Rank findings by relevance to the query.
        3. Synthesize the top results into a cohesive answer.
      `,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const content = response.text || "No results found.";
    
    // Extract grounding metadata for sources
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: string[] = (chunks as any[])
      .map((c: any) => c.web?.uri)
      .filter((uri: unknown): uri is string => typeof uri === 'string');

    const uniqueSources = Array.from(new Set(sources));

    return { 
      content, 
      sources: uniqueSources,
      rankingScore: uniqueSources.length > 0 ? 100 : 0
    };
  } catch (error) {
    console.error("Search Agent failed", error);
    return { content: "Search execution failed due to an error.", sources: [], rankingScore: 0 };
  }
};