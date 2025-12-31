import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../store/appStore';
import { TaskStatus, MessageRole } from '../types';

// Core Agents
import { planResearch } from './planner';
import { executeTask as executeSearch } from './researcher'; // Search Agent
import { synthesizeReport } from './synthesizer';
import { formatReport } from './reporter';
import { generateSuggestions } from './suggester';
import { evaluateQuality } from './quality_control';

// Supporting Agents
import { getRelevantContext, deduplicateQuery } from './context_manager';
import { RetryAgent } from './retry_recovery';
import { verifyFindings } from './verifier';
import { extractKeyData } from './extraction';
import { generateBibliography } from './citation';

// Enhancement Agents
import { detectTrends } from './trend_detector';
import { analyzeData } from './data_analysis';
import { translateContent } from './multilanguage';

export const startResearchProcess = async (sessionId: string, userGoal: string) => {
  const store = useStore.getState();

  try {
    const session = store.sessions.find(s => s.id === sessionId);
    const context = getRelevantContext(session?.messages || []);
    const settings = store.userSettings;

    // 1. Context Manager & Planner
    await store.addMessage(sessionId, MessageRole.SYSTEM, "Orchestrator: Initializing agents...");
    
    const plan = await RetryAgent.run(() => planResearch(userGoal, context, settings), "Planning");
    
    const tasks = plan.tasks.map(t => ({
      id: uuidv4(),
      title: t.title,
      description: t.description,
      query: deduplicateQuery(t.query, []), // Simple dedupe for now
      status: TaskStatus.PENDING,
      sourceUrls: [],
      qualityScore: 0
    }));

    await store.updateSessionTasks(sessionId, tasks);
    await store.addMessage(sessionId, MessageRole.SYSTEM, `Task Planner: Created ${tasks.length} tasks.`);

    const findingsAccumulator: { task: string; result: string }[] = [];
    const allSources: string[] = [];

    // 2. Research Loop
    for (const task of tasks) {
      await store.updateTaskStatus(sessionId, task.id, TaskStatus.IN_PROGRESS);
      
      // Search Agent (with Retry)
      const searchResult = await RetryAgent.run(() => executeSearch(task.query), "Search");
      
      // Quality Control Agent
      const quality = await evaluateQuality(searchResult.content, searchResult.sources);
      
      // Verification Agent
      const verification = await verifyFindings(task.title, searchResult.content, searchResult.sources);
      
      // Extraction Agent (Background, log for now)
      // const structuredData = await extractKeyData(searchResult.content);

      allSources.push(...searchResult.sources);
      findingsAccumulator.push({ task: task.title, result: searchResult.content });

      await store.updateTaskStatus(
        sessionId, 
        task.id, 
        TaskStatus.COMPLETED, 
        searchResult.content,
        searchResult.sources,
        verification
      );
    }

    await store.addMessage(sessionId, MessageRole.SYSTEM, "Research Orchestrator: Tasks complete. Analyzing data...");

    // 3. Post-Processing & Enhancement
    
    // Trend Detector Agent
    const trends = await detectTrends(findingsAccumulator.map(f => f.result));
    
    // Synthesis Agent
    const rawSynthesis = await synthesizeReport(userGoal, findingsAccumulator, trends, settings);
    
    // Report Agent (Formatting)
    const formattedReport = await formatReport(rawSynthesis, 'academic'); // Default to academic structure
    
    // Multi-Language Agent (Translation if needed)
    const finalContent = await translateContent(formattedReport, settings.language);
    
    // Citation Agent
    const bibliography = generateBibliography(Array.from(new Set(allSources)));
    
    const finalReport = `${finalContent}\n\n## References\n${bibliography}`;

    await store.setSynthesis(sessionId, finalReport);

    // Suggestion Agent
    const suggestions = await generateSuggestions(finalContent);

    // Final Output
    await store.addMessage(
      sessionId, 
      MessageRole.MODEL, 
      `## Research Complete\n\nI have finished researching "${userGoal}".\n\n**Summary of Findings:**\n${trends}\n\nA detailed report has been generated. You can view it using the "View Report" button.`,
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