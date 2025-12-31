import { GoogleGenAI } from "@google/genai";
import { useStore } from "../store/appStore";

export const getAiClient = () => {
  // Try process.env first, then user settings
  let apiKey = process.env.API_KEY;
  if (!apiKey) {
    const settings = useStore.getState().userSettings;
    apiKey = settings.apiKey;
  }
  
  if (!apiKey) {
    throw new Error("API Key Missing. Please configure it in Settings.");
  }
  
  return new GoogleGenAI({ apiKey });
};

export const MODEL_REASONING = 'gemini-3-pro-preview';
export const MODEL_FAST = 'gemini-3-flash-preview'; 

export const checkApiKey = () => {
  try {
    getAiClient();
    return true;
  } catch (e) {
    return false;
  }
};