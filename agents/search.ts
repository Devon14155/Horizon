import { getAiClient, MODEL_FAST } from "../services/geminiService";
import { Source } from "../types";

export interface SearchResult {
  content: string;
  sources: Source[];
  rankingScore?: number;
}

// Define the shape of the grounding metadata from the API
interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export const executeSearch = async (query: string): Promise<SearchResult> => {
  const ai = getAiClient();

  // Orchestrate the search using Gemini's grounding
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
    
    // Extract grounding metadata for sources including titles
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
    
    const sources: Source[] = chunks
      .filter(c => c.web?.uri)
      .map(c => ({
        url: c.web?.uri || "",
        title: c.web?.title || (c.web?.uri ? new URL(c.web.uri).hostname : "Unknown Source")
      }));

    // Deduplicate sources by URL
    const uniqueSources = Array.from(new Map(sources.map(s => [s.url, s])).values());

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