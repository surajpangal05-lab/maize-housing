/**
 * Simple per-host rate limiter using a token bucket approach.
 */
export class RateLimiter {
  private lastRequest = new Map<string, number>();
  private readonly intervalMs: number;

  constructor(requestsPerSecond: number = 1) {
    this.intervalMs = 1000 / requestsPerSecond;
  }

  async wait(host: string): Promise<void> {
    const now = Date.now();
    const last = this.lastRequest.get(host) || 0;
    const elapsed = now - last;

    if (elapsed < this.intervalMs) {
      const delay = this.intervalMs - elapsed;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    this.lastRequest.set(host, Date.now());
  }
}
