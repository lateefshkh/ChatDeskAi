// src/app/api/health/route.ts
//
// Purpose: Minimal health check endpoint for uptime monitors.
//
// Returns: { status: "ok", timestamp, version }
//
// Design:
// - No DB connection test (uptime monitor should not burden DB).
// - No env vars leaked.
// - No build info / stack traces.
//
// Ye kyun zaroori hai:
// - Uptime monitors publicly accessible endpoint hit karte hain.
// - Agar DB status ya build details dikhein, attacker ko infrastructure intel milti hai.
// - Generic "ok" response sufficient hai.

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "0.1.0",
    },
    { status: 200 }
  );
}