import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../store/appStore';
import { TaskStatus, MessageRole } from '../types';

// Core Agents
import { planResearch } from './planner'; // Agent 1
import { executeSearch } from './search'; // Agent 2 (Replaced researcher.ts)
import { synthesizeReport } from './synthesizer'; // Agent 5
import { formatReport } from './reporter'; // Agent 6
import { generateSuggestions } from './suggester'; // Agent 7
import { evaluateQuality } from './quality_control'; // Agent 4

// Supporting Agents
import { getRelevantContext, deduplicateQuery } from './context_manager'; // Agent 8
import { RetryAgent } from './retry_recovery'; // Agent 10
import { verifyFindings } from './verifier'; // Agent 9
import { extractKeyData } from './extraction'; // Agent 11
import { generateBibliography } from './citation'; // Agent 12

// Enhancement Agents
import { detectTrends } from './trend_detector'; // Agent 14
import { analyzeData } from './data_analysis'; // Agent 15
import { translateContent } from './multilanguage'; // Agent 16
// Personalization (Agent 13) is used inside Planner and Synthesizer

export const startResearchProcess = async (sessionId: string, userGoal: string) => {
  const store = useStore.getState();

  try {
    const session = store.sessions.find(s => s.id === sessionId);
    const context = getRelevantContext(session?.messages || []);
    const settings = store.userSettings;

    // --- PHASE 1: PLANNING ---
    await store.addMessage(sessionId, MessageRole.SYSTEM, "Orchestrator: Initializing 16-Agent System...");
    
    // Agent 1: Task Planner
    const plan = await RetryAgent.run(() => planResearch(userGoal, context, settings), "Planning");
    
    const tasks = plan.tasks.map(t => ({
      id: uuidv4(),
      title: t.title,
      description: t.description,
      query: deduplicateQuery(t.query, []), // Agent 8: Context Manager (Deduplication)
      status: TaskStatus.PENDING,
      sourceUrls: [],
      qualityScore: 0
    }));

    await store.updateSessionTasks(sessionId, tasks);
    await store.addMessage(sessionId, MessageRole.SYSTEM, `Task Planner: Created ${tasks.length} tasks based on '${settings.expertiseLevel}' profile.`);

    const findingsAccumulator: { task: string; result: string }[] = [];
    const allSources: string[] = [];

    // --- PHASE 2: EXECUTION & VERIFICATION ---
    for (const task of tasks) {
      await store.updateTaskStatus(sessionId, task.id, TaskStatus.IN_PROGRESS);
      
      // Agent 2: Search Agent
      const searchResult = await RetryAgent.run(() => executeSearch(task.query), "Search");
      
      // Agent 4: Quality Control
      const quality = await evaluateQuality(searchResult.content, searchResult.sources);
      
      // Agent 9: Verification Agent
      const verification = await verifyFindings(task.title, searchResult.content, searchResult.sources);
      
      // Agent 11: Extraction Agent (Extract structured data for potential future use)
      const structuredData = await extractKeyData(searchResult.content);
      if (Object.keys(structuredData).length > 0) {
        console.log(`[Extraction Agent] Extracted data for ${task.title}`, structuredData);
      }

      allSources.push(...searchResult.sources);
      findingsAccumulator.push({ task: task.title, result: searchResult.content });

      // Update UI with status and verification results
      await store.updateTaskStatus(
        sessionId, 
        task.id, 
        TaskStatus.COMPLETED, 
        searchResult.content,
        searchResult.sources,
        verification
      );
    }

    await store.addMessage(sessionId, MessageRole.SYSTEM, "Research Orchestrator: Analysis complete. Synthesizing report...");

    // --- PHASE 3: SYNTHESIS & ENHANCEMENT ---
    
    // Agent 14: Trend Detector
    const trends = await detectTrends(findingsAccumulator.map(f => f.result));
    
    // Agent 15: Data Analysis (Check for charts)
    const combinedText = findingsAccumulator.map(f => f.result).join("\n");
    const chartData = await analyzeData(combinedText); // Used by UI if present
    
    // Agent 5: Synthesis Agent
    const rawSynthesis = await synthesizeReport(userGoal, findingsAccumulator, trends, settings);
    
    // Agent 6: Report Agent
    const formattedReport = await formatReport(rawSynthesis, 'academic', settings);
    
    // Agent 16: Multi-Language Agent
    const finalContent = await translateContent(formattedReport, settings.language);
    
    // Agent 12: Citation Agent
    const bibliography = generateBibliography(Array.from(new Set(allSources)));
    
    const finalReport = `${finalContent}\n\n## References\n${bibliography}`;

    await store.setSynthesis(sessionId, finalReport);

    // Agent 7: Suggestion Agent
    const suggestions = await generateSuggestions(finalContent);

    // Final Output
    await store.addMessage(
      sessionId, 
      MessageRole.MODEL, 
      `## Research Complete\n\nI have finished researching "${userGoal}".\n\n**Key Trends Identified:**\n${trends}\n\nA detailed report has been generated. You can view it using the "View Report" button.`,
      suggestions
    );

  } catch (error) {
    console.error("Research Orchestrator failed:", error);
    await store.addMessage(sessionId, MessageRole.SYSTEM, "System Error: The research process encountered an unexpected error.");
    
    // Mark remaining tasks as failed
    const session = store.sessions.find(s => s.id === sessionId);
    if (session) {
      const failedTasks = session.tasks.filter(t => t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS);
      for (const task of failedTasks) {
        await store.updateTaskStatus(sessionId, task.id, TaskStatus.FAILED);
      }
    }
  }
};