/**
 * In-memory sliding window rate limiter.
 * Simple implementation for demonstration/development.
 * In a production environment with multiple instances, use Redis.
 */
const requestLogs = new Map<number, number[]>(); // apiKeyId -> timestamps

export function isRateLimited(apiKeyId: number, limit = 100, windowMs = 60000): boolean {
  const now = Date.now();
  const logs = requestLogs.get(apiKeyId) || [];

  // Remove logs older than the window
  const validLogs = logs.filter((timestamp) => now - timestamp < windowMs);

  if (validLogs.length >= limit) {
    return true;
  }

  validLogs.push(now);
  requestLogs.set(apiKeyId, validLogs);

  return false;
}
