import { NextRequest, NextResponse } from "next/server";

import { geolocation } from "@vercel/functions";

export async function middleware(req: NextRequest) {
  const country = geolocation(req)?.country;
  // Temporarily blocking traffic from Russia since I have too many requests from there.
  if (country === "RU") {
    return new NextResponse("Access Denied", { status: 403 });
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Optionally, specify paths to apply the middleware
export const config = {
  matcher: "/:path*", // Apply to all routes
};
