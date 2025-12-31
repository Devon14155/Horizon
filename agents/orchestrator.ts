import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../store/appStore';
import { planResearch } from './planner';
import { executeTask } from './researcher';
import { synthesizeReport } from './synthesizer';
import { verifyFindings } from './verifier';
import { generateSuggestions } from './suggester';
import { TaskStatus, MessageRole } from '../types';

export const startResearchProcess = async (sessionId: string, userGoal: string) => {
  const store = useStore.getState();

  try {
    // 1. Planner Agent
    await store.addMessage(sessionId, MessageRole.SYSTEM, "Plan: Analyzing request and generating tasks...");
    
    const plan = await planResearch(userGoal);
    const tasks = plan.tasks.map(t => ({
      id: uuidv4(),
      title: t.title,
      description: t.description,
      query: t.query,
      status: TaskStatus.PENDING,
      sourceUrls: [],
      qualityScore: 0
    }));

    await store.updateSessionTasks(sessionId, tasks);
    await store.addMessage(sessionId, MessageRole.SYSTEM, `Plan: Generated ${tasks.length} tasks. Handing off to Research Agent.`);

    // 2. Research & QC Agent
    const findingsAccumulator: { task: string; result: string }[] = [];

    for (const task of tasks) {
      await store.updateTaskStatus(sessionId, task.id, TaskStatus.IN_PROGRESS);
      
      const result = await executeTask(task.query);
      
      // 3. Verification Agent (NEW)
      const verification = await verifyFindings(task.title, result.content, result.sources);
      
      await store.updateTaskStatus(
        sessionId, 
        task.id, 
        TaskStatus.COMPLETED, 
        result.content,
        result.sources,
        verification
      );

      findingsAccumulator.push({ task: task.title, result: result.content });
    }

    // 4. Synthesis Agent
    await store.addMessage(sessionId, MessageRole.SYSTEM, "Synthesis: All tasks completed. Synthesizing final report...");
    const finalReport = await synthesizeReport(userGoal, findingsAccumulator);
    
    await store.setSynthesis(sessionId, finalReport);
    
    // 5. Suggestion Agent (NEW)
    const suggestions = await generateSuggestions(finalReport);
    
    const finalMessageId = uuidv4();
    // Manually add message to include suggestions
    const session = await import('../database/db').then(m => m.db.sessions.get(sessionId));
    if (session) {
        const newMessage = {
            id: finalMessageId,
            role: MessageRole.MODEL,
            content: finalReport,
            timestamp: Date.now(),
            suggestions: suggestions
        };
        const updatedSession = { ...session, messages: [...session.messages, newMessage], updatedAt: Date.now() };
        await import('../database/db').then(m => m.db.sessions.put(updatedSession));
        store.loadSession(sessionId); // Force reload state
    }

    await store.addMessage(sessionId, MessageRole.SYSTEM, "Report generated. Click 'View Report' to export.");

  } catch (error) {
    console.error("Research Process Failed", error);
    await store.addMessage(sessionId, MessageRole.SYSTEM, `Error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};