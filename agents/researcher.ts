import { getAiClient, MODEL_FAST } from "../services/geminiService";

export interface SearchResult {
  content: string;
  sources: string[];
}

// Renamed logic to Search Agent behavior
export const executeTask = async (query: string): Promise<SearchResult> => {
  const ai = getAiClient();

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: `
        Search Agent Task: Investigate "${query}". 
        Provide detailed, factual information. 
        Focus on answering the query directly with data.
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

    return { 
      content, 
      sources: Array.from(new Set(sources))
    };
  } catch (error) {
    console.error("Search failed", error);
    return { content: "Search execution failed.", sources: [] };
  }
};