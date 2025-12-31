import { getAiClient, MODEL_REASONING } from "../services/geminiService";

export const synthesizeReport = async (goal: string, findings: { task: string; result: string }[]): Promise<string> => {
  const ai = getAiClient();

  const findingsText = findings.map(f => `### Task: ${f.task}\nFindings: ${f.result}`).join('\n\n');

  const prompt = `
    You are a Senior Research Analyst.
    Original Goal: "${goal}"
    
    Based on the following research findings, generate a comprehensive detailed synthesis.
    
    Structure:
    1. Executive Summary
    2. Key Findings (Structured)
    3. Detailed Analysis
    4. Contradictions or Gaps (if any)
    5. Conclusion & Recommendations
    
    Format: Use Markdown with clear headers.
    
    Research Data:
    ${findingsText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_REASONING,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 2048 } // Increased budget for deep synthesis
      }
    });

    return response.text || "Could not generate report.";
  } catch (error) {
    console.error("Synthesis failed", error);
    return "Failed to synthesize report.";
  }
};