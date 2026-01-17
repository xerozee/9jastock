import { NextRequest, NextResponse } from "next/server";
import { runCrawler } from "@/lib/socialCrawler";
import { getAuthenticatedUser } from "@/lib/server-auth";

export const maxDuration = 60;

let lastCrawlTime: number | null = null;
const CRAWL_COOLDOWN_MS = 60000;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const adminKey = process.env.ADMIN_API_KEY;

    const hasAdminKey = adminKey && authHeader === `Bearer ${adminKey}`;
    const user = await getAuthenticatedUser();

    if (!hasAdminKey && !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required. Please log in to use this feature.",
        },
        { status: 401 }
      );
    }

    if (lastCrawlTime && Date.now() - lastCrawlTime < CRAWL_COOLDOWN_MS) {
      const remainingSeconds = Math.ceil(
        (CRAWL_COOLDOWN_MS - (Date.now() - lastCrawlTime)) / 1000
      );
      return NextResponse.json(
        {
          success: false,
          error: `Please wait ${remainingSeconds} seconds before crawling again.`,
        },
        { status: 429 }
      );
    }

    lastCrawlTime = Date.now();

    console.log("Starting social media crawler...");
    const result = await runCrawler();

    return NextResponse.json({
      success: result.success,
      message: `Processed ${result.postsProcessed} new posts`,
      postsProcessed: result.postsProcessed,
      errors: result.errors.length > 0 ? result.errors.slice(0, 5) : undefined,
    });
  } catch (error: unknown) {
    console.error("Crawler API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Social media crawler endpoint. Use POST to trigger a crawl.",
    endpoints: {
      "POST /api/social/crawl":
        "Run the crawler to fetch new posts (requires authentication)",
      "GET /api/social": "Get social feed posts",
    },
  });
}
