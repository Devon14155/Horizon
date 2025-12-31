import { GoogleGenAI } from "@google/genai";

export const getAiClient = () => {
  // Guidelines: API key must be obtained exclusively from the environment variable process.env.API_KEY.
  // Guidelines: Do not generate UI elements for entering the API key.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const MODEL_REASONING = 'gemini-3-pro-preview';
export const MODEL_FAST = 'gemini-3-flash-preview'; 

export const checkApiKey = () => {
  // API key is a hard requirement from the environment.
  return !!process.env.API_KEY;
};