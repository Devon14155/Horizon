/**
 * Implements the Retry & Recovery Agent strategy from the blueprint.
 * Uses exponential backoff to handle API instability or rate limits.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  retries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry if it's a permanent error (e.g., Auth failure)
      if (error.message?.includes('API_KEY') || error.status === 401) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, i);
      console.warn(`Attempt ${i + 1} failed, retrying in ${delay}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}