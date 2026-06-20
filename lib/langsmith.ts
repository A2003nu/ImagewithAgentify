import { Client, getDefaultProjectName } from "langsmith";
import { v4 as uuidv4 } from "uuid";

const client = new Client();

export async function startTrace(name: string, inputs: Record<string, unknown>) {
  const runId = uuidv4();
  try {
    await client.createRun({
      id: runId,
      name,
      inputs,
      run_type: "chain",
      project_name: getDefaultProjectName(),
      start_time: Date.now(),
    });
  } catch (err) {
    console.error("LangSmith trace creation failed:", err);
  }
  return runId;
}

export async function endTrace(
  runId: string | null,
  outputs: Record<string, unknown>,
  error?: string
) {
  if (!runId) return;
  try {
    await client.updateRun(runId, {
      outputs,
      error,
      end_time: Date.now(),
    });
  } catch (err) {
    console.error("LangSmith trace update failed:", err);
  }
}
