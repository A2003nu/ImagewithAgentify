import type {
  WorkflowResult,
  WorkflowValidationResult,
  Step,
  Agent,
  Tool,
  StepType,
  AgentType,
} from "@/types/WorkflowType";

export const validateWorkflow = (
  workflow: any
): WorkflowValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!workflow || typeof workflow !== "object") {
    errors.push("Workflow must be an object");
    return { isValid: false, errors, warnings };
  }

  if (!workflow.workflowName || typeof workflow.workflowName !== "string") {
    errors.push("workflowName is required and must be a string");
  }

  if (!workflow.goal || typeof workflow.goal !== "string") {
    errors.push("goal is required and must be a string");
  }

  if (!Array.isArray(workflow.steps) || workflow.steps.length === 0) {
    errors.push("steps must be a non-empty array");
  } else {
    const stepIds = new Set<string>();
    const stepIdCounts: Record<string, number> = {};

    workflow.steps.forEach((step: any, index: number) => {
      if (!step.id || typeof step.id !== "string") {
        errors.push(`Step at index ${index} must have a valid id`);
      } else {
        stepIds.add(step.id);
        stepIdCounts[step.id] = (stepIdCounts[step.id] || 0) + 1;

        if (stepIdCounts[step.id] > 1) {
          errors.push(`Duplicate step id: ${step.id}`);
        }
      }

      if (!step.type || typeof step.type !== "string") {
        errors.push(`Step at index ${index} must have a valid type`);
      }

      if (
        step.dependencies &&
        !Array.isArray(step.dependencies)
      ) {
        errors.push(
          `Step ${step.id || index} dependencies must be an array`
        );
      }

      if (step.next && typeof step.next !== "object") {
        errors.push(`Step ${step.id || index} next must be an object`);
      }
    });

    const hasEndStep = workflow.steps.some(
      (step: Step) => step.type === "End"
    );
    if (!hasEndStep) {
      warnings.push("Workflow should have at least one End step");
    }

    workflow.steps?.forEach((step: Step, index: number) => {
      if (step.dependencies) {
        step.dependencies.forEach((depId: string) => {
          if (!stepIds.has(depId)) {
            errors.push(
              `Step ${step.id} depends on non-existent step: ${depId}`
            );
          }
        });
      }
    });
  }

  if (!Array.isArray(workflow.agents)) {
    errors.push("agents must be an array");
  } else {
    const agentIds = new Set<string>();
    const agentTypeCounts: Record<string, number> = {};

    workflow.agents.forEach((agent: any, index: number) => {
      if (!agent.id || typeof agent.id !== "string") {
        errors.push(`Agent at index ${index} must have a valid id`);
      } else {
        agentIds.add(agent.id);
      }

      if (!agent.name || typeof agent.name !== "string") {
        errors.push(`Agent at index ${index} must have a valid name`);
      } else {
        const validAgentTypes = ["Planner", "Researcher", "Executor", "Reviewer"];
        if (!validAgentTypes.includes(agent.name)) {
          warnings.push(
            `Agent ${agent.id} has non-standard type: ${agent.name}`
          );
        }
      }

      if (!agent.systemPrompt || typeof agent.systemPrompt !== "string") {
        warnings.push(`Agent ${agent.id} should have a systemPrompt`);
      }

      if (agent.name) {
        agentTypeCounts[agent.name] = (agentTypeCounts[agent.name] || 0) + 1;
      }
    });

    const usedAgents = new Set<string>();
    workflow.steps?.forEach((step: Step) => {
      if (step.agent?.id) {
        usedAgents.add(step.agent.id);
      }
    });

    workflow.agents?.forEach((agent: Agent) => {
      if (!usedAgents.has(agent.id)) {
        warnings.push(`Agent ${agent.id} is defined but not used in any step`);
      }
    });

    ["Planner", "Executor"].forEach((requiredType) => {
      if (!agentTypeCounts[requiredType]) {
        warnings.push(`Recommended agent type '${requiredType}' is missing`);
      }
    });
  }

  if (!Array.isArray(workflow.tools)) {
    errors.push("tools must be an array");
  } else {
    const toolIds = new Set<string>();

    workflow.tools.forEach((tool: any, index: number) => {
      if (!tool.id || typeof tool.id !== "string") {
        errors.push(`Tool at index ${index} must have a valid id`);
      } else {
        toolIds.add(tool.id);
      }

      if (!tool.type || !["api", "function", "condition", "formatter"].includes(tool.type)) {
        errors.push(
          `Tool ${tool.id || index} must have a valid type (api, function, condition, formatter)`
        );
      }
    });

    const usedTools = new Set<string>();
    workflow.agents?.forEach((agent: Agent) => {
      if (agent.tools) {
        agent.tools.forEach((toolId: string) => usedTools.add(toolId));
      }
    });

    workflow.steps?.forEach((step: Step) => {
      if (step.agent?.tools) {
        step.agent.tools.forEach((toolId: string) => usedTools.add(toolId));
      }
    });

    workflow.tools?.forEach((tool: Tool) => {
      if (!usedTools.has(tool.id)) {
        warnings.push(`Tool ${tool.id} is defined but not used`);
      }
    });
  }

  if (
    workflow.estimatedComplexity &&
    !["low", "medium", "high"].includes(workflow.estimatedComplexity)
  ) {
    warnings.push("estimatedComplexity should be 'low', 'medium', or 'high'");
  }

  if (workflow.estimatedSteps && typeof workflow.estimatedSteps !== "number") {
    warnings.push("estimatedSteps should be a number");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const enrichWorkflow = (workflow: WorkflowResult): WorkflowResult => {
  const stepIdSet = new Set(workflow.steps.map((s) => s.id));

  const enrichedSteps = workflow.steps.map((step) => {
    const validDependencies = (step.dependencies || []).filter((dep) =>
      stepIdSet.has(dep)
    );

    const validNext = {
      success: step.next?.success && stepIdSet.has(step.next.success)
        ? step.next.success
        : null,
      failure: step.next?.failure && stepIdSet.has(step.next.failure)
        ? step.next.failure
        : null,
    };

    return {
      ...step,
      dependencies: validDependencies,
      next: validNext,
    };
  });

  const agentIdSet = new Set(workflow.agents.map((a) => a.id));

  const enrichedAgents = workflow.agents.map((agent) => ({
    ...agent,
    tools: agent.tools.filter((t) => typeof t === "string"),
  }));

  const toolIdSet = new Set(workflow.tools.map((t) => t.id));

  const enrichedTools = workflow.tools.filter((tool) => toolIdSet.has(tool.id));

  const dependencies: Record<string, string[]> = {};
  enrichedSteps.forEach((step) => {
    if (step.dependencies.length > 0) {
      dependencies[step.id] = step.dependencies;
    }
  });

  return {
    ...workflow,
    steps: enrichedSteps,
    agents: enrichedAgents,
    tools: enrichedTools,
    dependencies,
    estimatedSteps: enrichedSteps.length,
  };
};

export const convertWorkflowToReactFlow = (workflow: WorkflowResult) => {
  const nodes = workflow.steps.map((step, index) => ({
    id: step.id,
    type: mapStepTypeToNodeType(step.type),
    position: { x: 250, y: 150 + index * 150 },
    data: {
      label: step.name,
      type: step.type,
      description: step.description,
      settings: {
        name: step.name,
        instructions: step.agent?.instruction || "",
        ...step.config,
      },
    },
  }));

  const edges: any[] = [];

  workflow.steps.forEach((step) => {
    if (step.next?.success) {
      edges.push({
        source: step.id,
        target: step.next.success,
        sourceHandle: "out",
        targetHandle: "in",
        animated: true,
        id: `${step.id}-${step.next.success}`,
      });
    }

    if (step.next?.failure) {
      edges.push({
        source: step.id,
        target: step.next.failure,
        sourceHandle: "failure",
        targetHandle: "in",
        animated: true,
        id: `${step.id}-${step.next.failure}-fail`,
      });
    }
  });

  return { nodes, edges };
};

const mapStepTypeToNodeType = (stepType: StepType): string => {
  const typeMap: Record<StepType, string> = {
    Planner: "AgentNode",
    Researcher: "AgentNode",
    Executor: "AgentNode",
    Reviewer: "AgentNode",
    API: "ApiNode",
    Approval: "UserApprovalNode",
    Condition: "IfElseNode",
    Loop: "WhileNode",
    End: "EndNode",
    Analyzer: "AgentNode",
    ContentGenerator: "AgentNode",
    Optimizer: "AgentNode",
    Personalizer: "AgentNode",
    Predictor: "AgentNode",
    Action: "ApiNode",
    SpamAnalyzer: "AgentNode",
    PDFParser: "AgentNode",
    ResumeParser: "AgentNode",
    RoleMatcher: "AgentNode",
    Scorer: "AgentNode",
    QuestionGenerator: "AgentNode",
    DecisionMaker: "AgentNode",
    SymptomExtractor: "AgentNode",
    PatternAnalyzer: "AgentNode",
    RiskFlagger: "AgentNode",
    RecommendationProvider: "AgentNode",
    GoalAnalyzer: "AgentNode",
    StudyPlanGenerator: "AgentNode",
    PlanOptimizer: "AgentNode",
    ConceptRecommender: "AgentNode",
    ErrorAnalyzer: "AgentNode",
    RootCauseAnalyzer: "AgentNode",
    FixGenerator: "AgentNode",
  };

  return typeMap[stepType] || "AgentNode";
};

export const generateWorkflowSummary = (workflow: WorkflowResult): string => {
  const stepCounts: Record<StepType, number> = {
    Planner: 0,
    Researcher: 0,
    Executor: 0,
    Reviewer: 0,
    Condition: 0,
    Loop: 0,
    API: 0,
    Approval: 0,
    End: 0,
    Analyzer: 0,
    ContentGenerator: 0,
    Optimizer: 0,
    Personalizer: 0,
    Predictor: 0,
    Action: 0,
    SpamAnalyzer: 0,
    PDFParser: 0,
    ResumeParser: 0,
    RoleMatcher: 0,
    Scorer: 0,
    QuestionGenerator: 0,
    DecisionMaker: 0,
    SymptomExtractor: 0,
    PatternAnalyzer: 0,
    RiskFlagger: 0,
    RecommendationProvider: 0,
    GoalAnalyzer: 0,
    StudyPlanGenerator: 0,
    PlanOptimizer: 0,
    ConceptRecommender: 0,
    ErrorAnalyzer: 0,
    RootCauseAnalyzer: 0,
    FixGenerator: 0,
  };

  workflow.steps.forEach((step) => {
    stepCounts[step.type]++;
  });

  const agentCounts: Record<AgentType, number> = {
    Planner: 0,
    Researcher: 0,
    Executor: 0,
    Reviewer: 0,
    "Audience Analyzer": 0,
    "Content Generator": 0,
    "Subject Optimizer": 0,
    "Email Personalizer": 0,
    "Engagement Predictor": 0,
    "Email Sender": 0,
    "Spam Score Analyzer": 0,
    "Resume Extractor": 0,
    "Resume Parser": 0,
    "Candidate Analyzer": 0,
    "Role Matcher": 0,
    "Candidate Scorer": 0,
    "SWOT Analyzer": 0,
    "Interview Question Generator": 0,
    "Decision Maker": 0,
    "Complaint Analyzer": 0,
    "Information Gatherer": 0,
    "Delay Investigator": 0,
    "Complaint Resolver": 0,
    "Escalation Agent": 0,
    "Resolution Verifier": 0,
    "Intent Detector": 0,
    "Details Collector": 0,
    "Post Generator": 0,
    "Output Formatter": 0,
    "Details Extractor": 0,
    "Script Generator": 0,
    "Viral Reel Generator": 0,
    "Symptom Extractor": 0,
    "Pattern Analyzer": 0,
    "Risk Flag Agent": 0,
    "Recommendation Agent": 0,
    "Goal Analyzer": 0,
    "Study Plan Generator": 0,
    "Plan Optimizer": 0,
    "Concept Recommender": 0,
    "Error Analyzer": 0,
    "Root Cause Analyzer": 0,
    "Fix Generator": 0,
  };

  workflow.agents.forEach((agent) => {
    if (agent.name in agentCounts) {
      agentCounts[agent.name]++;
    }
  });

  const summary = {
    totalSteps: workflow.steps.length,
    totalAgents: workflow.agents.length,
    totalTools: workflow.tools.length,
    complexity: workflow.estimatedComplexity,
    stepBreakdown: stepCounts,
    agentBreakdown: agentCounts,
    hasConditionals: stepCounts.Condition > 0,
    hasLoops: stepCounts.Loop > 0,
    requiresApproval: stepCounts.Approval > 0,
  };

  return JSON.stringify(summary, null, 2);
};
