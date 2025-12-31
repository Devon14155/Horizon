import { withRetry } from "../utils/retry";

export class RetryAgent {
    static async run<T>(operation: () => Promise<T>, description: string = "Operation"): Promise<T> {
        try {
            return await withRetry(operation, 3, 2000);
        } catch (error) {
            console.error(`${description} failed after retries.`, error);
            throw error;
        }
    }
    
    static async attemptRecovery<T>(primary: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
        try {
            return await this.run(primary);
        } catch (e) {
            console.warn("Primary failed, attempting fallback...");
            return await fallback();
        }
    }
}