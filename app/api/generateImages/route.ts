import Together from "together-ai";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

let rateLimit: Ratelimit | undefined;

// Mock Redis for rate limiting fallback
class MockRedisForRateLimit {
  private storage = new Map<string, { count: number; resetTime: number }>();

  async incr(key: string): Promise<number> {
    const now = Date.now();
    const windowStart = Math.floor(now / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000);
    const resetTime = windowStart + (24 * 60 * 60 * 1000);

    const current = this.storage.get(key);
    if (!current || current.resetTime <= now) {
      this.storage.set(key, { count: 1, resetTime });
      return 1;
    }

    current.count += 1;
    this.storage.set(key, current);
    return current.count;
  }

  async expire(): Promise<boolean> {
    return true; // Mock implementation
  }
}

// Create rate limiter with fallback
function createRateLimit(): Ratelimit | undefined {
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    return undefined;
  }

  try {
    return new Ratelimit({
      redis: Redis.fromEnv(),
      // Allow 100 requests per day (~5-10 prompts)
      limiter: Ratelimit.fixedWindow(100, "1440 m"),
      analytics: true,
      prefix: "blinkshot",
    });
  } catch (error) {
    console.warn('Failed to initialize Redis rate limiter, using fallback:', error);
    try {
      return new Ratelimit({
        redis: new MockRedisForRateLimit() as any,
        limiter: Ratelimit.fixedWindow(100, "1440 m"),
        analytics: false, // Disable analytics for mock
        prefix: "blinkshot-fallback",
      });
    } catch (fallbackError) {
      console.error('Failed to create fallback rate limiter:', fallbackError);
      return undefined;
    }
  }
}

rateLimit = createRateLimit();

interface ImageGenerationOptions {
  prompt: string;
  model: string;
  width: number;
  height: number;
  seed?: number;
  steps: number;
  response_format: "base64";
}

export async function POST(req: Request) {
  const json = await req.json();
  const { prompt, userAPIKey, iterativeMode } = z
    .object({
      prompt: z.string(),
      iterativeMode: z.boolean(),
      userAPIKey: z.string().optional(),
    })
    .parse(json);

  // Add observability if a Helicone key is specified, otherwise skip
  const options: ConstructorParameters<typeof Together>[0] = {};
  if (process.env.HELICONE_API_KEY) {
    options.baseURL = "https://together.helicone.ai/v1";
    options.defaultHeaders = {
      "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
      "Helicone-Property-BYOK": userAPIKey ? "true" : "false",
    };
  }

  const client = new Together(options);

  if (userAPIKey) {
    client.apiKey = userAPIKey;
  }

  if (rateLimit && !userAPIKey) {
    try {
      const identifier = await getIPAddress();
      const { success } = await rateLimit.limit(identifier);
      if (!success) {
        return Response.json(
          "No requests left. Please add your own API key or try again in 24h.",
          {
            status: 429,
          },
        );
      }
    } catch (error) {
      console.warn('Rate limiting unavailable due to Redis error:', error);
      // Continue without rate limiting rather than failing the request
      // In production, you might want to implement a more sophisticated fallback
    }
  }

  let response;
  try {
    response = await client.images.create({
      prompt,
      model: "black-forest-labs/FLUX.1-schnell",
      width: 1024,
      height: 768,
      seed: iterativeMode ? 123 : undefined,
      steps: 3,
      response_format: "base64",
    } as ImageGenerationOptions);
  } catch (e: any) {
    return Response.json(
      { error: e.toString() },
      {
        status: 500,
      },
    );
  }

  return Response.json(response.data[0]);
}

export const runtime = "edge";

async function getIPAddress() {
  const FALLBACK_IP_ADDRESS = "0.0.0.0";
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0] ?? FALLBACK_IP_ADDRESS;
  }

  const xRealIp = headersList.get("x-real-ip");
  return xRealIp ?? FALLBACK_IP_ADDRESS;
}
