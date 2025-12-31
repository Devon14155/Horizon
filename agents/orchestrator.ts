import { useStore } from '../store/appStore';
import { MessageRole, ToolMode } from '../types';
import { ResearchAgent } from './researcher';

export const startResearchProcess = async (sessionId: string, userGoal: string, toolMode: ToolMode = 'web') => {
  const store = useStore.getState();

  try {
    await store.addMessage(
      sessionId, 
      MessageRole.SYSTEM, 
      `Orchestrator: Initializing ${toolMode === 'web' ? 'Quick' : 'Deep'} Research System...`
    );

    const agent = new ResearchAgent(sessionId, userGoal, toolMode);
    await agent.run();

  } catch (error) {
    console.error("Orchestrator Start Failed:", error);
    store.setLoadingStatus(null);
    await store.addMessage(sessionId, MessageRole.SYSTEM, "System Error: Could not initialize research agent.");
  }
};