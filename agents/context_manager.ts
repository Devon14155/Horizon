import { Message, MessageRole } from '../types';

export const getRelevantContext = (messages: Message[]): string => {
  // Extract last 10 turns to maintain immediate context
  const recentHistory = messages
    .filter(m => m.role !== MessageRole.SYSTEM)
    .slice(-10)
    .map(m => `${m.role.toUpperCase()}: ${m.content.substring(0, 300)}...`)
    .join('\n');

  return recentHistory ? `\nRECENT CONVERSATION HISTORY:\n${recentHistory}` : "";
};

const levenshtein = (a: string, b: string): number => {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
  for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

export const deduplicateQuery = (query: string, previousQueries: string[]): string => {
    // Check for exact match
    if (previousQueries.includes(query)) {
        return `${query} (in-depth analysis)`;
    }

    // Check for high similarity (fuzzy deduplication)
    for (const prev of previousQueries) {
        const distance = levenshtein(query.toLowerCase(), prev.toLowerCase());
        const similarity = 1 - (distance / Math.max(query.length, prev.length));
        
        if (similarity > 0.8) {
             return `${query} (focused details)`;
        }
    }

    return query;
};