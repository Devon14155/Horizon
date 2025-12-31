import { generateChartData, ChartData } from "../tools/visualizer";

export const analyzeData = async (fullText: string): Promise<ChartData | null> => {
    // Delegates to the visualization tool which uses Gemini
    return await generateChartData(fullText);
};