import { getAiClient, MODEL_REASONING } from "../services/geminiService";
import { UserSettings } from "../types";
import { personalizePrompt } from "./personalization";

export const synthesizeReport = async (
    goal: string, 
    findings: { task: string; result: string }[], 
    trends: string,
    settings: UserSettings
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

  try {
    const response = await ai.models.generateContent({
      model: MODEL_REASONING,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 2048 }
      }
    });

    return response.text || "Could not generate report.";
  } catch (error) {
    console.error("Synthesis failed", error);
    return "Failed to synthesize report.";
  }
};