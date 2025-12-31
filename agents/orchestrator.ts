import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../store/appStore';
import { TaskStatus, MessageRole, Source, ToolMode, ResearchTask } from '../types';

// Core Agents
import { planResearch, PlanResult } from './planner'; // Agent 1
import { executeSearch } from './search'; // Agent 2
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

export const startResearchProcess = async (sessionId: string, userGoal: string, toolMode: ToolMode = 'web') => {
  const store = useStore.getState();

  try {
    const session = store.sessions.find(s => s.id === sessionId);
    const context = getRelevantContext(session?.messages || []);
    const settings = store.userSettings;

    // --- PHASE 1: PLANNING ---
    store.setLoadingStatus("Deconstructing research goal...");
    await store.addMessage(sessionId, MessageRole.SYSTEM, `Orchestrator: Initializing ${toolMode === 'web' ? 'Quick' : 'Deep'} Research System...`);
    
    // Agent 1: Task Planner with Graceful Degradation
    let plan: PlanResult;
    try {
      // Pass toolMode to allow planner to decide on task complexity
      plan = await RetryAgent.run(() => planResearch(userGoal, context, settings, toolMode), "Planning");
    } catch (planningError) {
      console.warn("Planning Agent failed, falling back to default plan.", planningError);
      // Fallback Plan ensures the system continues even if the LLM fails to structure tasks
      plan = {
        tasks: [{
          title: "Comprehensive Research",
          description: "Investigate the core topic thoroughly using available sources.",
          query: userGoal
        }]
      };
      await store.addMessage(sessionId, MessageRole.SYSTEM, "Task Planner: Optimization failed. Reverting to standard research execution.");
    }
    
    // Agent 8: Deduplication (using existing session tasks as history)
    const previousQueries = session?.tasks.map(t => t.query) || [];
    
    const tasks: ResearchTask[] = plan.tasks.map(t => ({
      id: uuidv4(),
      title: t.title,
      description: t.description,
      query: deduplicateQuery(t.query, previousQueries), 
      status: TaskStatus.PENDING,
      sourceUrls: [],
      sources: [],
      qualityScore: 0
    }));

    await store.updateSessionTasks(sessionId, tasks);
    
    if (tasks.length > 1) {
        await store.addMessage(sessionId, MessageRole.SYSTEM, `Task Planner: Created ${tasks.length} tasks based on '${settings.expertiseLevel}' profile.`);
    }

    const findingsAccumulator: { task: string; result: string }[] = [];
    const allSources: Source[] = [];

    // --- PHASE 2: EXECUTION & VERIFICATION (PARALLELIZED) ---
    store.setLoadingStatus("Executing research tasks...");
    
    // Define the unit of work for a single task
    const processTask = async (task: ResearchTask) => {
      await store.updateTaskStatus(sessionId, task.id, TaskStatus.IN_PROGRESS);
      
      // Agent 2: Search Agent
      const searchResult = await RetryAgent.run(() => executeSearch(task.query), "Search");
      
      // Agent 4: Quality Control
      const sourceUrls = searchResult.sources.map(s => s.url);
      const quality = await evaluateQuality(searchResult.content, sourceUrls);
      
      // Agent 9: Verification Agent
      const verification = await verifyFindings(task.title, searchResult.content, sourceUrls);
      
      // Agent 11: Extraction Agent
      const structuredData = await extractKeyData(searchResult.content);
      if (Object.keys(structuredData).length > 0) {
        console.log(`[Extraction Agent] Extracted data for ${task.title}`, structuredData);
      }

      // Return data to be aggregated
      return {
        taskTitle: task.title,
        taskId: task.id,
        content: searchResult.content,
        sources: searchResult.sources,
        verification
      };
    };

    // Execute tasks in batches to manage concurrency
    const BATCH_SIZE = 3;
    for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
      const batch = tasks.slice(i, i + BATCH_SIZE);
      store.setLoadingStatus(`Processing tasks ${i + 1}-${Math.min(i + BATCH_SIZE, tasks.length)} of ${tasks.length}...`);
      
      const batchResults = await Promise.all(batch.map(task => processTask(task)));

      // Process results from the batch
      for (const res of batchResults) {
        allSources.push(...res.sources);
        findingsAccumulator.push({ task: res.taskTitle, result: res.content });
        
        await store.updateTaskStatus(
          sessionId, 
          res.taskId, 
          TaskStatus.COMPLETED, 
          res.content, 
          res.sources, 
          res.verification
        );
      }
    }

    await store.addMessage(sessionId, MessageRole.SYSTEM, "Research Orchestrator: Analysis complete. Synthesizing report...");

    // --- PHASE 3: SYNTHESIS & ENHANCEMENT ---
    store.setLoadingStatus("Analyzing cross-source trends...");
    
    // Agent 14: Trend Detector
    const trends = await detectTrends(findingsAccumulator.map(f => f.result));
    
    // Agent 15: Data Analysis
    const combinedText = findingsAccumulator.map(f => f.result).join("\n");
    const chartData = await analyzeData(combinedText); 
    
    // Agent 5: Synthesis Agent
    // Pass toolMode to enable thinking budget in synthesis
    store.setLoadingStatus("Synthesizing final report...");
    const rawSynthesis = await synthesizeReport(userGoal, findingsAccumulator, trends, settings, toolMode);
    
    // Agent 6: Report Agent
    store.setLoadingStatus("Formatting document...");
    const formattedReport = await formatReport(rawSynthesis, 'academic', settings);
    
    // Agent 16: Multi-Language Agent
    const finalContent = await translateContent(formattedReport, settings.language);
    
    // Agent 12: Citation Agent
    // Deduplicate sources by URL before bibliography
    const uniqueSources = Array.from(new Map(allSources.map(s => [s.url, s])).values());
    const bibliography = generateBibliography(uniqueSources);
    
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

    store.setLoadingStatus(null);

  } catch (error) {
    console.error("Research Orchestrator failed:", error);
    store.setLoadingStatus(null);
    await store.addMessage(sessionId, MessageRole.SYSTEM, "System Error: The research process encountered an unexpected error.");
    
    const session = store.sessions.find(s => s.id === sessionId);
    if (session) {
      const failedTasks = session.tasks.filter(t => t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS);
      for (const task of failedTasks) {
        await store.updateTaskStatus(sessionId, task.id, TaskStatus.FAILED);
      }
    }
  }
};