import { getAiClient, MODEL_REASONING } from "../services/geminiService";
import { UserSettings, ToolMode } from "../types";
import { personalizePrompt } from "./personalization";

export const synthesizeReport = async (
    goal: string, 
    findings: { task: string; result: string }[], 
    trends: string,
    settings: UserSettings,
    toolMode: ToolMode = 'web'
): Promise<string> => {
  const ai = getAiClient();

  const findingsText = findings.map(f => `### Task: ${f.task}\nFindings: ${f.result}`).join('\n\n');

  const basePrompt = `
    You are a Synthesis Agent.
    Original Goal: "${goal}"
    Identified Trends: "${trends}"
    
    Based on the following research findings, generate a comprehensive detailed synthesis.
    
    Structure:
    1. Executive Summary
    2. Key Trends & Patterns
    3. Detailed Analysis
    4. Data Insights
    5. Conclusion
    
    Format: Use Markdown with clear headers.
    
    Research Data:
    ${findingsText}
  `;

  const prompt = personalizePrompt(basePrompt, settings);

  // Set thinking budget based on mode
  let budget = 0;
  if (toolMode === 'thinking') {
      budget = 4096; // High budget for deep reasoning
  } else if (toolMode === 'research') {
      budget = 2048; // Moderate budget for standard research
  } else {
      budget = 0; // Low/No budget for quick web search results
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_REASONING,
      contents: prompt,
      config: {
        thinkingConfig: budget > 0 ? { thinkingBudget: budget } : undefined
      }
    });

    return response.text || "Could not generate report.";
  } catch (error) {
    console.error("Synthesis failed", error);
    return "Failed to synthesize report.";
  }
};