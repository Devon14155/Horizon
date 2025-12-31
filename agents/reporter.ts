import { getAiClient, MODEL_FAST } from "../services/geminiService";
import { UserSettings } from "../types";

export type ReportTemplate = 'academic' | 'business' | 'simple' | 'technical';

export const formatReport = async (
  synthesis: string, 
  template: ReportTemplate = 'academic',
  settings?: UserSettings
): Promise<string> => {
  const ai = getAiClient();
  
  // Template definitions
  const templates = {
    academic: "Strict structure: Abstract, Introduction, Methodology (implied), Findings, Discussion, Conclusion. Formal tone.",
    business: "Executive Summary, Key Insights, Strategic Implications, Recommendations. Professional/Corporate tone.",
    simple: "TL;DR, Main Points, Details, Takeaway. Plain English (ELI5).",
    technical: "Technical Abstract, Architecture/System Analysis, Implementation Details, Performance/Metrics. High technical density."
  };

  const selectedTemplate = templates[template] || templates.academic;
  
  const prompt = `
    ROLE: Report Agent
    TASK: Format the provided research synthesis into a document.
    
    TEMPLATE STYLE: ${template.toUpperCase()}
    TEMPLATE RULES: ${selectedTemplate}
    
    USER EXPERTISE: ${settings?.expertiseLevel || 'expert'}
    
    CONTENT TO FORMAT:
    ${synthesis}
    
    OUTPUT: 
    Return ONLY the formatted Markdown content. Do not add conversational filler.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt
    });

    return response.text || synthesis;
  } catch (error) {
    console.error("Report Agent failed", error);
    return synthesis; // Fallback to original
  }
};