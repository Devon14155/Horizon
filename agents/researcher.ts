import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../store/appStore';
import { TaskStatus, MessageRole, Source, ToolMode, ResearchTask } from '../types';

// Core Agents
import { planResearch, PlanResult } from './planner';
import { executeSearch } from './search';
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

export class ResearchAgent {
  private sessionId: string;
  private goal: string;
  private toolMode: ToolMode;

  constructor(sessionId: string, goal: string, toolMode: ToolMode = 'web') {
    this.sessionId = sessionId;
    this.goal = goal;
    this.toolMode = toolMode;
  }

  public async run(): Promise<void> {
    const store = useStore.getState();
    const session = store.sessions.find(s => s.id === this.sessionId);
    if (!session) throw new Error("Session not found");

    const settings = store.userSettings;
    const context = getRelevantContext(session.messages || []);

    try {
      // --- PHASE 1: PLANNING ---
      store.setLoadingStatus("Deconstructing research goal...");
      
      let plan: PlanResult;
      try {
        plan = await RetryAgent.run(() => planResearch(this.goal, context, settings, this.toolMode), "Planning");
      } catch (planningError) {
        console.warn("Planning Agent failed, falling back to default plan.", planningError);
        plan = {
          tasks: [{
            title: "Research Execution",
            description: "Execute comprehensive research on the topic.",
            query: this.goal
          }]
        };
        await store.addMessage(this.sessionId, MessageRole.SYSTEM, "Task Planner: Optimization failed. Reverting to standard execution.");
      }

      // Deduplication & Task Creation
      const previousQueries = session.tasks.map(t => t.query) || [];
      const tasks: ResearchTask[] = plan.tasks.map(t => ({
        id: uuidv4(),
        title: t.title,
        description: t.description,
        query: deduplicateQuery(t.query, previousQueries),
        status: TaskStatus.PENDING,
        sourceUrls: [],
        sources: []
      }));

      await store.updateSessionTasks(this.sessionId, tasks);
      
      if (tasks.length > 1) {
        await store.addMessage(this.sessionId, MessageRole.SYSTEM, `Task Planner: Created ${tasks.length} tasks based on '${settings.expertiseLevel}' profile.`);
      }

      // --- PHASE 2: EXECUTION ---
      store.setLoadingStatus("Executing research tasks...");
      const results = await this.executeTasks(tasks, store);

      // --- PHASE 3: SYNTHESIS ---
      await store.addMessage(this.sessionId, MessageRole.SYSTEM, "Research Orchestrator: Analysis complete. Synthesizing report...");
      store.setLoadingStatus("Analyzing cross-source trends...");

      // Parallel Enhancements
      const [trends, chartData] = await Promise.all([
        detectTrends(results.map(r => r.result)),
        analyzeData(results.map(r => r.result).join("\n"))
      ]);

      // Report Generation
      store.setLoadingStatus("Synthesizing final report...");
      const rawSynthesis = await synthesizeReport(this.goal, results, trends, settings, this.toolMode);
      
      store.setLoadingStatus("Formatting document...");
      const formattedReport = await formatReport(rawSynthesis, 'academic', settings);
      
      // Localization
      const finalContent = await translateContent(formattedReport, settings.language);

      // Bibliography
      const uniqueSources = Array.from(new Map(results.flatMap(r => r.sources).map(s => [s.url, s])).values());
      const bibliography = generateBibliography(uniqueSources);
      const finalReport = `${finalContent}\n\n## References\n${bibliography}`;

      await store.setSynthesis(this.sessionId, finalReport);

      // --- PHASE 4: CLOSE OUT ---
      const suggestions = await generateSuggestions(finalContent);

      await store.addMessage(
        this.sessionId, 
        MessageRole.MODEL, 
        `## Research Complete\n\nI have finished researching "${this.goal}".\n\n**Key Trends Identified:**\n${trends}\n\nA detailed report has been generated. You can view it using the "View Report" button.`,
        suggestions
      );

      store.setLoadingStatus(null);

    } catch (error) {
      console.error("Research Loop Error:", error);
      store.setLoadingStatus(null);
      await store.addMessage(this.sessionId, MessageRole.SYSTEM, "System Error: The research process encountered an unexpected error.");
      this.markRemainingTasksFailed(store);
    }
  }

  private async executeTasks(tasks: ResearchTask[], store: any) {
    const findingsAccumulator: { task: string; result: string; sources: Source[] }[] = [];
    const BATCH_SIZE = 3;

    for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
      const batch = tasks.slice(i, i + BATCH_SIZE);
      store.setLoadingStatus(`Processing tasks ${i + 1}-${Math.min(i + BATCH_SIZE, tasks.length)} of ${tasks.length}...`);

      const batchResults = await Promise.all(batch.map(task => this.processSingleTask(task, store)));
      
      batchResults.forEach(res => {
        if (res) findingsAccumulator.push(res);
      });
    }
    return findingsAccumulator;
  }

  private async processSingleTask(task: ResearchTask, store: any) {
    try {
      await store.updateTaskStatus(this.sessionId, task.id, TaskStatus.IN_PROGRESS);

      // Agent 2: Search
      const searchResult = await RetryAgent.run(() => executeSearch(task.query), "Search");

      // Agent 4: Quality Control
      const sourceUrls = searchResult.sources.map(s => s.url);
      const quality = await evaluateQuality(searchResult.content, sourceUrls);

      // Agent 9: Verification
      const verification = await verifyFindings(task.title, searchResult.content, sourceUrls);

      // Agent 11: Extraction (Fire and forget logging)
      extractKeyData(searchResult.content).then(data => {
        if (Object.keys(data).length > 0) console.log(`[Extraction] ${task.title}`, data);
      });

      await store.updateTaskStatus(
        this.sessionId,
        task.id,
        TaskStatus.COMPLETED,
        searchResult.content,
        searchResult.sources,
        verification,
        quality
      );

      return {
        task: task.title,
        result: searchResult.content,
        sources: searchResult.sources
      };
    } catch (error) {
      console.error(`Task "${task.title}" failed:`, error);
      await store.updateTaskStatus(this.sessionId, task.id, TaskStatus.FAILED);
      return null;
    }
  }

  private async markRemainingTasksFailed(store: any) {
    const session = store.sessions.find((s: any) => s.id === this.sessionId);
    if (session) {
      const incomplete = session.tasks.filter((t: any) => t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS);
      for (const task of incomplete) {
        await store.updateTaskStatus(this.sessionId, task.id, TaskStatus.FAILED);
      }
    }
  }
}