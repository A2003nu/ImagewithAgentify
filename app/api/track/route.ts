import { NextRequest, NextResponse } from "next/server";
import { registerMetrics, trackVoiceMode, trackApiCall, trackConfidence } from "@/lib/prometheus";

registerMetrics();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case "voice_mode":
        trackVoiceMode(data.mode as "voice" | "text");
        break;
      case "api_call":
        trackApiCall(data.apiName as string);
        break;
      case "confidence":
        trackConfidence(data.score as number);
        break;
      default:
        console.warn("[TRACK] Unknown track type:", type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[TRACK] Failed to track:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}