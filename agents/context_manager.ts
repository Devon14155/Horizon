import { Message, MessageRole } from '../types';

export const getRelevantContext = (messages: Message[]): string => {
  // Extract last 5 turns to maintain immediate context
  const recentHistory = messages
    .filter(m => m.role !== MessageRole.SYSTEM)
    .slice(-10)
    .map(m => `${m.role.toUpperCase()}: ${m.content.substring(0, 300)}...`)
    .join('\n');

  return recentHistory ? `\nRECENT CONVERSATION HISTORY:\n${recentHistory}` : "";
};

export const deduplicateQuery = (query: string, previousQueries: string[]): string => {
    // Simple deduplication logic, could be enhanced with AI
    if (previousQueries.includes(query)) {
        return `${query} (additional information)`;
    }
    return query;
};