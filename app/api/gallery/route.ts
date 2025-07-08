import { redis, isRedisConfigured } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    const { prompt, imageBase64 } = await req.json();

    if (!prompt || !imageBase64) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Store in Redis with a timestamp
    const item = {
      prompt,
      imageBase64,
      createdAt: new Date().toISOString(),
    };

    await redis.zadd("gallery", {
      score: Date.now(),
      member: JSON.stringify(item), // Ensure we're storing a string
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Gallery submission error:", error);
    return Response.json(
      { error: "Failed to save to gallery" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    // Check if Redis is properly configured
    if (!isRedisConfigured()) {
      console.log("Redis not configured, returning empty gallery for development");
      return Response.json([]);
    }

    // Get the latest 50 gallery items, sorted by timestamp
    const items = await redis.zrange("gallery", 0, 49, {
      rev: true,
    });

    // Safely parse each item
    const gallery = items
      .map((item: any) => {
        try {
          // Handle both string and object cases
          if (typeof item === "string") {
            return JSON.parse(item);
          } else if (typeof item === "object" && item !== null) {
            return item;
          }
          console.warn("Unexpected item type in gallery:", typeof item);
          return null;
        } catch (e) {
          console.error("Failed to parse gallery item:", e);
          return null;
        }
      })
      .filter(Boolean); // Remove any null items

    return Response.json(gallery);
  } catch (error) {
    console.error("Gallery fetch error:", error);

    // Provide more specific error messages
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const isUrlError = errorMessage.includes("URL") || errorMessage.includes("ERR_INVALID_URL");

    if (isUrlError) {
      return Response.json({
        error: "Redis configuration error. Please check your UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.",
        details: "Visit https://console.upstash.com/redis to get your credentials"
      }, { status: 500 });
    }

    return Response.json({
      error: "Failed to fetch gallery",
      details: errorMessage
    }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return Response.json({ error: "Missing imageBase64" }, { status: 400 });
    }

    // Find and remove the item with matching imageBase64
    const items = await redis.zrange("gallery", 0, -1);

    for (const item of items) {
      try {
        // Handle both string and object cases
        const parsed = typeof item === "string" ? JSON.parse(item) : item;

        if (parsed && parsed.imageBase64 === imageBase64) {
          // Make sure we remove the stringified version that was stored
          const stringifiedItem =
            typeof item === "string" ? item : JSON.stringify(item);
          await redis.zrem("gallery", stringifiedItem);
          return Response.json({ success: true });
        }
      } catch (e) {
        console.error("Failed to parse gallery item during deletion:", e);
        continue; // Skip invalid items
      }
    }

    return Response.json(
      { error: "Image not found in gallery" },
      { status: 404 },
    );
  } catch (error) {
    console.error("Gallery deletion error:", error);
    return Response.json(
      { error: "Failed to delete from gallery" },
      { status: 500 },
    );
  }
}
