import { NextResponse } from "next/server";
import { registerMetrics, getMetrics } from "@/lib/prometheus";

registerMetrics();

export async function GET() {
  try {
    const metrics = await getMetrics();
    
    return new NextResponse(metrics, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("[METRICS] Failed to serve metrics:", error);
    return new NextResponse("# Metrics unavailable", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}