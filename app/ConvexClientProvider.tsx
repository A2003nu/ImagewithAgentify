"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

export const convex = convexUrl
  ? new ConvexReactClient(convexUrl)
  : undefined;

if (!convex) {
  console.warn("⚠️ Convex not configured (missing NEXT_PUBLIC_CONVEX_URL)");
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    return <>{children}</>;
  }
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}