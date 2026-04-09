import type { WorkflowResult, Step, Agent, Tool } from "@/types/WorkflowType";

export const createEmptyWorkflow = (goal: string): WorkflowResult => ({
  workflowName: "New Workflow",
  description: "",
  goal,
  steps: [],
  agents: [],
  tools: [],
  dependencies: {},
  estimatedComplexity: "low",
  estimatedSteps: 0,
});

export const createStep = (
  name: string,
  type: string,
  description: string = ""
): Step => ({
  id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  name,
  type: type as any,
  description,
  dependencies: [],
  next: {
    success: null,
    failure: null,
  },
  config: {},
});

export const createAgent = (
  name: string,
  role: string,
  systemPrompt: string
): Agent => ({
  id: name.toLowerCase(),
  name: name as any,
  role,
  capabilities: [],
  tools: [],
  model: "llama-3.3-70b-versatile",
  systemPrompt,
});

export const createTool = (
  name: string,
  type: string,
  description: string,
  config: any = {}
): Tool => ({
  id: name.toLowerCase().replace(/\s+/g, "-"),
  name,
  type: type as any,
  description,
  config,
});

export const addStepToWorkflow = (
  workflow: WorkflowResult,
  step: Step,
  afterStepId?: string
): WorkflowResult => {
  const newSteps = [...workflow.steps];

  if (afterStepId) {
    const insertIndex = newSteps.findIndex((s) => s.id === afterStepId);
    if (insertIndex !== -1) {
      newSteps.splice(insertIndex + 1, 0, step);
    } else {
      newSteps.push(step);
    }
  } else {
    newSteps.push(step);
  }

  return {
    ...workflow,
    steps: newSteps,
    estimatedSteps: newSteps.length,
  };
};

export const removeStepFromWorkflow = (
  workflow: WorkflowResult,
  stepId: string
): WorkflowResult => {
  const newSteps = workflow.steps
    .filter((s) => s.id !== stepId)
    .map((step) => ({
      ...step,
      dependencies: step.dependencies?.filter((dep) => dep !== stepId) || [],
      next: {
        success: step.next?.success === stepId ? null : step.next?.success,
        failure: step.next?.failure === stepId ? null : step.next?.failure,
      },
    }));

  const newDependencies = { ...workflow.dependencies };
  delete newDependencies[stepId];

  Object.keys(newDependencies).forEach((key) => {
    newDependencies[key] = newDependencies[key].filter(
      (dep) => dep !== stepId
    );
    if (newDependencies[key].length === 0) {
      delete newDependencies[key];
    }
  });

  return {
    ...workflow,
    steps: newSteps,
    tools: workflow.tools,
    dependencies: newDependencies,
    estimatedSteps: newSteps.length,
  };
};

export const updateStepInWorkflow = (
  workflow: WorkflowResult,
  stepId: string,
  updates: Partial<Step>
): WorkflowResult => {
  const newSteps = workflow.steps.map((step) =>
    step.id === stepId ? { ...step, ...updates } : step
  );

  return {
    ...workflow,
    steps: newSteps,
  };
};

export const addDependency = (
  workflow: WorkflowResult,
  stepId: string,
  dependencyId: string
): WorkflowResult => {
  const newSteps = workflow.steps.map((step) =>
    step.id === stepId
      ? {
          ...step,
          dependencies: [...(step.dependencies || []), dependencyId],
        }
      : step
  );

  const newDependencies = {
    ...workflow.dependencies,
    [stepId]: [...(workflow.dependencies[stepId] || []), dependencyId],
  };

  return {
    ...workflow,
    steps: newSteps,
    dependencies: newDependencies,
  };
};

export const removeDependency = (
  workflow: WorkflowResult,
  stepId: string,
  dependencyId: string
): WorkflowResult => {
  const newSteps = workflow.steps.map((step) =>
    step.id === stepId
      ? {
          ...step,
          dependencies: (step.dependencies || []).filter(
            (dep) => dep !== dependencyId
          ),
        }
      : step
  );

  const newDependencies = { ...workflow.dependencies };
  if (newDependencies[stepId]) {
    newDependencies[stepId] = newDependencies[stepId].filter(
      (dep) => dep !== dependencyId
    );
    if (newDependencies[stepId].length === 0) {
      delete newDependencies[stepId];
    }
  }

  return {
    ...workflow,
    steps: newSteps,
    dependencies: newDependencies,
  };
};

export const getStepDependencies = (
  workflow: WorkflowResult,
  stepId: string
): Step[] => {
  const step = workflow.steps.find((s) => s.id === stepId);
  if (!step || !step.dependencies) return [];

  return workflow.steps.filter((s) => step.dependencies.includes(s.id));
};

export const getStepDependents = (
  workflow: WorkflowResult,
  stepId: string
): Step[] => {
  return workflow.steps.filter(
    (step) =>
      step.next?.success === stepId || step.next?.failure === stepId
  );
};

export const detectCircularDependencies = (
  workflow: WorkflowResult
): string[][] => {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const dfs = (stepId: string, path: string[]): boolean => {
    visited.add(stepId);
    recursionStack.add(stepId);
    path.push(stepId);

    const step = workflow.steps.find((s) => s.id === stepId);
    if (!step) {
      path.pop();
      recursionStack.delete(stepId);
      return false;
    }

    const neighbors = [
      ...(step.dependencies || []),
      step.next?.success,
      step.next?.failure,
    ].filter(Boolean);

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor!)) {
        if (dfs(neighbor!, path)) {
          return true;
        }
      } else if (recursionStack.has(neighbor!)) {
        const cycleStart = path.indexOf(neighbor!);
        cycles.push(path.slice(cycleStart));
        return true;
      }
    }

    path.pop();
    recursionStack.delete(stepId);
    return false;
  };

  for (const step of workflow.steps) {
    if (!visited.has(step.id)) {
      dfs(step.id, []);
    }
  }

  return cycles;
};

export const calculateWorkflowMetrics = (
  workflow: WorkflowResult
): {
  totalSteps: number;
  totalAgents: number;
  totalTools: number;
  maxDepth: number;
  hasConditionals: boolean;
  hasLoops: boolean;
  hasApprovals: boolean;
  estimatedComplexity: "low" | "medium" | "high";
} => {
  const stepTypes = new Set(workflow.steps.map((s) => s.type));

  const maxDepth = calculateMaxDepth(workflow);

  let complexityScore = 0;
  complexityScore += workflow.steps.length * 1;
  complexityScore += workflow.agents.length * 2;
  complexityScore += workflow.tools.length * 1.5;
  if (stepTypes.has("Condition")) complexityScore += 3;
  if (stepTypes.has("Loop")) complexityScore += 4;
  if (stepTypes.has("Approval")) complexityScore += 2;
  complexityScore += maxDepth * 1;

  let estimatedComplexity: "low" | "medium" | "high" = "low";
  if (complexityScore > 30) estimatedComplexity = "high";
  else if (complexityScore > 15) estimatedComplexity = "medium";

  return {
    totalSteps: workflow.steps.length,
    totalAgents: workflow.agents.length,
    totalTools: workflow.tools.length,
    maxDepth,
    hasConditionals: stepTypes.has("Condition"),
    hasLoops: stepTypes.has("Loop"),
    hasApprovals: stepTypes.has("Approval"),
    estimatedComplexity,
  };
};

const calculateMaxDepth = (workflow: WorkflowResult): number => {
  const depths: Record<string, number> = {};

  const calculateDepth = (stepId: string): number => {
    if (depths[stepId] !== undefined) return depths[stepId];

    const step = workflow.steps.find((s) => s.id === stepId);
    if (!step || !step.dependencies || step.dependencies.length === 0) {
      depths[stepId] = 1;
      return 1;
    }

    const maxDepDepth = Math.max(
      ...step.dependencies.map((depId) => calculateDepth(depId))
    );
    depths[stepId] = maxDepDepth + 1;
    return depths[stepId];
  };

  workflow.steps.forEach((step) => calculateDepth(step.id));

  return Math.max(0, ...Object.values(depths));
};

export const cloneWorkflow = (workflow: WorkflowResult): WorkflowResult => {
  const idMapping = new Map<string, string>();

  const newSteps = workflow.steps.map((step) => {
    const newId = `${step.id}-copy-${Date.now()}`;
    idMapping.set(step.id, newId);
    return {
      ...step,
      id: newId,
      dependencies: step.dependencies?.map((depId) => {
        if (!idMapping.has(depId)) {
          idMapping.set(depId, `${depId}-copy-${Date.now()}`);
        }
        return idMapping.get(depId)!;
      }),
      next: {
        success: step.next?.success
          ? idMapping.get(step.next.success) || step.next.success
          : null,
        failure: step.next?.failure
          ? idMapping.get(step.next.failure) || step.next.failure
          : null,
      },
    };
  });

  const newAgents = workflow.agents.map((agent) => ({
    ...agent,
    id: `${agent.id}-copy-${Date.now()}`,
  }));

  const newDependencies: Record<string, string[]> = {};
  Object.entries(workflow.dependencies).forEach(([key, deps]) => {
    const newKey = idMapping.get(key) || key;
    newDependencies[newKey] = deps.map((dep) => idMapping.get(dep) || dep);
  });

  return {
    ...workflow,
    workflowName: `${workflow.workflowName} (Copy)`,
    steps: newSteps,
    agents: newAgents,
    dependencies: newDependencies,
  };
};

export const exportWorkflowToJSON = (workflow: WorkflowResult): string => {
  return JSON.stringify(workflow, null, 2);
};

export const importWorkflowFromJSON = (json: string): WorkflowResult | null => {
  try {
    const parsed = JSON.parse(json);
    if (
      parsed.workflowName &&
      Array.isArray(parsed.steps) &&
      Array.isArray(parsed.agents)
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};
