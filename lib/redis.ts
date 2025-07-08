import { Redis } from "@upstash/redis";

// Mock Redis implementation for development when credentials aren't available
class MockRedis {
  private storage = new Map<string, any>();

  async zadd(key: string, options: { score: number; member: string }) {
    if (!this.storage.has(key)) {
      this.storage.set(key, []);
    }
    const items = this.storage.get(key);
    // Remove existing item with same member
    const filtered = items.filter((item: any) => item.member !== options.member);
    filtered.push(options);
    // Sort by score descending
    filtered.sort((a: any, b: any) => b.score - a.score);
    this.storage.set(key, filtered);
    return 1;
  }

  async zrange(key: string, start: number, stop: number, options?: { rev?: boolean }) {
    const items = this.storage.get(key) || [];
    let slice = items.slice(start, stop === -1 ? undefined : stop + 1);
    if (options?.rev) {
      slice = slice.reverse();
    }
    return slice.map((item: any) => item.member);
  }

  async zrem(key: string, member: string) {
    if (!this.storage.has(key)) return 0;
    const items = this.storage.get(key);
    const filtered = items.filter((item: any) => item.member !== member);
    this.storage.set(key, filtered);
    return items.length - filtered.length;
  }
}

// Check if Redis environment variables are properly configured
function isRedisConfigured(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN &&
    process.env.UPSTASH_REDIS_REST_URL !== 'your_redis_url_here' &&
    process.env.UPSTASH_REDIS_REST_TOKEN !== 'your_redis_token_here'
  );
}

// Create Redis client with fallback to mock implementation
export function createRedisClient() {
  if (isRedisConfigured()) {
    try {
      return Redis.fromEnv();
    } catch (error) {
      console.warn('Failed to initialize Redis client, falling back to mock:', error);
      return new MockRedis();
    }
  } else {
    console.log('Redis not configured, using mock implementation for development');
    return new MockRedis();
  }
}

export const redis = createRedisClient();
export { isRedisConfigured };
