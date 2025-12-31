import { UserSettings } from '../types';

export const personalizePrompt = (basePrompt: string, settings: UserSettings): string => {
  let context = "";
  
  if (settings.expertiseLevel === 'expert') {
    context += "AUDIENCE: Expert/Technical. Use precise terminology, cite primary sources, and avoid simplification.\n";
  } else {
    context += "AUDIENCE: Beginner. Explain complex concepts simply, use analogies, and focus on clarity.\n";
  }

  if (settings.language && settings.language !== 'en') {
    context += `OUTPUT LANGUAGE: ${settings.language}. Translate all output to this language.\n`;
  }

  return `${context}\n${basePrompt}`;
};