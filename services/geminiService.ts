import { GoogleGenAI } from "@google/genai";
import { withRetry } from "../utils/retry";

export const getAiClient = () => {
  // Guidelines: API key must be obtained exclusively from the environment variable process.env.API_KEY.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const MODEL_REASONING = 'gemini-3-pro-preview';
export const MODEL_FAST = 'gemini-3-flash-preview'; 

export const checkApiKey = () => {
  return !!process.env.API_KEY;
};

// Re-export utility for easier imports in agents
export { withRetry };