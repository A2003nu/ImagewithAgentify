import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from "prom-client";

let registry: Registry | null = null;
let isInitialized = false;

function getRegistry(): Registry {
  if (!registry) {
    registry = new Registry();
    isInitialized = true;
  }
  return registry;
}

export const workflowRunsTotal = new Counter({
  name: "workflow_runs_total",
  help: "Total number of workflow executions",
  labelNames: ["workflow_type"],
  registers: [],
});

export const workflowActiveRuns = new Gauge({
  name: "workflow_active_runs",
  help: "Number of currently running workflows",
  registers: [],
});

export const workflowErrorsTotal = new Counter({
  name: "workflow_errors_total",
  help: "Total number of workflow failures",
  labelNames: ["workflow_type", "error_type"],
  registers: [],
});

export const agentExecutionDurationMs = new Histogram({
  name: "agent_execution_duration_ms",
  help: "Agent execution duration in milliseconds",
  labelNames: ["agent_name"],
  buckets: [100, 300, 500, 1000, 3000, 5000, 10000],
  registers: [],
});

export const confidenceScoreTotal = new Counter({
  name: "confidence_score_total",
  help: "Confidence score bucket distribution",
  labelNames: ["level"],
  registers: [],
});

export const voiceModeUsageTotal = new Counter({
  name: "voice_mode_usage_total",
  help: "Voice mode usage total",
  labelNames: ["mode"],
  registers: [],
});

export const externalApiCallsTotal = new Counter({
  name: "external_api_calls_total",
  help: "External API calls total",
  labelNames: ["api_name"],
  registers: [],
});

export function registerMetrics(): Registry {
  const reg = getRegistry();
  
  if (isInitialized) {
    try {
      reg.clear();
    } catch {
      // Registry may not have metrics to clear
    }
    isInitialized = false;
  }
  
  reg.registerMetric(workflowRunsTotal);
  reg.registerMetric(workflowActiveRuns);
  reg.registerMetric(workflowErrorsTotal);
  reg.registerMetric(agentExecutionDurationMs);
  reg.registerMetric(confidenceScoreTotal);
  reg.registerMetric(voiceModeUsageTotal);
  reg.registerMetric(externalApiCallsTotal);
  
  collectDefaultMetrics({ register: reg, prefix: "agentify_" });
  
  isInitialized = true;
  return reg;
}

export function trackWorkflowStart(workflowType: string): void {
  try {
    console.log(`[METRICS] Workflow started: ${workflowType}`);
    workflowRunsTotal.inc({ workflow_type: workflowType });
    workflowActiveRuns.inc();
    console.log(`[METRICS] ✓ Workflow tracking confirmed`);
  } catch (err) {
    console.warn("[METRICS] Failed to track workflow start:", err);
  }
}

export function trackWorkflowComplete(): void {
  try {
    workflowActiveRuns.dec();
    console.log("[METRICS] Workflow completed");
  } catch (err) {
    console.warn("[METRICS] Failed to track workflow complete:", err);
  }
}

export function trackWorkflowError(workflowType: string, errorType: string): void {
  try {
    workflowErrorsTotal.inc({ workflow_type: workflowType, error_type: errorType });
    workflowActiveRuns.dec();
    console.log(`[METRICS] Workflow error: ${workflowType} - ${errorType}`);
  } catch (err) {
    console.warn("[METRICS] Failed to track workflow error:", err);
  }
}

export function trackAgentExecution(agentName: string, durationMs: number): void {
  try {
    agentExecutionDurationMs.observe({ agent_name: agentName }, durationMs);
    console.log(`[METRICS] Agent execution tracked: ${agentName} - ${durationMs}ms`);
  } catch (err) {
    console.warn("[METRICS] Failed to track agent execution:", err);
  }
}

export function trackConfidence(confidence: number): void {
  try {
    let level: string;
    if (confidence >= 80) {
      level = "high";
    } else if (confidence >= 50) {
      level = "medium";
    } else {
      level = "low";
    }
    confidenceScoreTotal.inc({ level });
    console.log(`[METRICS] Confidence tracked: ${confidence} - ${level}`);
  } catch (err) {
    console.warn("[METRICS] Failed to track confidence:", err);
  }
}

export function trackVoiceMode(mode: "voice" | "text"): void {
  try {
    voiceModeUsageTotal.inc({ mode });
    console.log(`[METRICS] Voice mode tracked: ${mode}`);
  } catch (err) {
    console.warn("[METRICS] Failed to track voice mode:", err);
  }
}

export function trackApiCall(apiName: string): void {
  try {
    externalApiCallsTotal.inc({ api_name: apiName });
    console.log(`[METRICS] API call tracked: ${apiName}`);
  } catch (err) {
    console.warn("[METRICS] Failed to track API call:", err);
  }
}

export async function getMetrics(): Promise<string> {
  try {
    if (!registry || !isInitialized) {
      registerMetrics();
    }
    if (registry) {
      return await registry.metrics();
    }
    return "";
  } catch (err) {
    console.warn("[METRICS] Failed to get metrics:", err);
    return "";
  }
}

export function resetMetrics(): void {
  try {
    workflowRunsTotal.reset();
    workflowActiveRuns.reset();
    workflowErrorsTotal.reset();
    agentExecutionDurationMs.reset();
    confidenceScoreTotal.reset();
    voiceModeUsageTotal.reset();
    externalApiCallsTotal.reset();
    isInitialized = false;
  } catch (err) {
    console.warn("[METRICS] Failed to reset metrics:", err);
  }
}