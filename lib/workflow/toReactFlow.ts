import type { Node, Edge } from "@xyflow/react";
import type { WorkflowResult, Step } from "@/types/WorkflowType";

export interface FlowData {
  nodes: Node[];
  edges: Edge[];
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface LayoutDirection {
  type: "horizontal" | "vertical";
  spacing: number;
  levelSpacing?: number;
}

const DEFAULT_LAYOUT_OPTIONS = {
  horizontal: {
    spacing: 220,
    nodeWidth: 200,
    startX: 100,
    startY: 200,
    levelSpacing: 250,
  },
  vertical: {
    spacing: 150,
    nodeHeight: 100,
    startX: 250,
    startY: 50,
    levelSpacing: 180,
  },
};

const mapStepTypeToNodeType = (stepType: string): string => {
  const typeMap: Record<string, string> = {
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
    TravelAnalyzer: "AgentNode",
    TavilySearch: "ApiNode",
    ItineraryGenerator: "AgentNode",
    BudgetPlanner: "AgentNode",
    TravelTips: "AgentNode",
  };

  return typeMap[stepType] || "AgentNode";
};

const calculateBranchOffset = (
  step: Step,
  stepMap: Map<string, Step>
): number => {
  const BRANCH_OFFSET = 200;
  
  if (step.next?.failure && step.next?.success) {
    const failureStep = stepMap.get(step.next.failure);
    const successStep = stepMap.get(step.next.success);
    
    if (failureStep && successStep) {
      if (step.type === "Condition") {
        const stepIndex = Array.from(stepMap.keys()).indexOf(step.id);
        return stepIndex % 2 === 0 ? -BRANCH_OFFSET : BRANCH_OFFSET;
      }
    }
    
    if (failureStep) return -BRANCH_OFFSET;
    if (successStep) return BRANCH_OFFSET;
  }
  
  return 0;
};

const calculateNodePositions = (
  steps: Step[],
  dependencies: Record<string, string[]>,
  direction: LayoutDirection["type"] = "vertical"
): Map<string, NodePosition> => {
  const positions = new Map<string, NodePosition>();
  const visited = new Set<string>();
  const levels = new Map<string, number>();

  const getLevel = (stepId: string, depth: number = 0): number => {
    if (levels.has(stepId)) {
      return levels.get(stepId)!;
    }

    if (visited.has(stepId)) {
      return depth;
    }

    visited.add(stepId);

    const stepDeps = dependencies[stepId] || [];
    if (stepDeps.length === 0) {
      levels.set(stepId, 0);
      return 0;
    }

    const maxDepLevel = Math.max(
      ...stepDeps.map((depId) => getLevel(depId, depth + 1))
    );
    const level = maxDepLevel + 1;
    levels.set(stepId, level);

    return level;
  };

  steps.forEach((step) => {
    getLevel(step.id);
  });

  const stepsByLevel = new Map<number, Step[]>();
  steps.forEach((step) => {
    const level = levels.get(step.id) || 0;
    if (!stepsByLevel.has(level)) {
      stepsByLevel.set(level, []);
    }
    stepsByLevel.get(level)!.push(step);
  });

  const layout = DEFAULT_LAYOUT_OPTIONS[direction];

  if (direction === "horizontal") {
    const sortedLevels = Array.from(stepsByLevel.keys()).sort((a, b) => a - b);
    const stepMap = new Map(steps.map((s) => [s.id, s]));
    const levelIndices = new Map<number, number>();

    sortedLevels.forEach((level) => {
      levelIndices.set(level, 0);
    });

    sortedLevels.forEach((level) => {
      const levelSpacing = (layout as any).levelSpacing || 250;
      const stepsAtLevel = steps.filter((s: Step) => (levels.get(s.id) || 0) === level);

      stepsAtLevel.forEach((step: Step) => {
        const branchOffset = calculateBranchOffset(step, stepMap);
        const currentIndex = levelIndices.get(level) || 0;
        const yOffset = currentIndex * 120;

        positions.set(step.id, {
          x: layout.startX + level * levelSpacing,
          y: layout.startY + yOffset + branchOffset,
        });

        levelIndices.set(level, currentIndex + 1);
      });
    });
  } else {
    const sortedLevels = Array.from(stepsByLevel.keys()).sort((a, b) => a - b);
    const stepMap = new Map(steps.map((s) => [s.id, s]));
    const levelOffsets = new Map<number, number>();
    const levelIndices = new Map<number, number>();

    sortedLevels.forEach((level) => {
      levelOffsets.set(level, 0);
      levelIndices.set(level, 0);
    });

    sortedLevels.forEach((level) => {
      const stepsAtCurrentLevel = steps.filter((s: Step) => (levels.get(s.id) || 0) === level);
      const levelSpacing = (layout as any).levelSpacing || 180;

      stepsAtCurrentLevel.forEach((step: Step) => {
        const branchOffset = calculateBranchOffset(step, stepMap);
        const currentIndex = levelIndices.get(level) || 0;
        const yOffset = currentIndex * layout.spacing;

        positions.set(step.id, {
          x: layout.startX + branchOffset,
          y: layout.startY + level * levelSpacing + yOffset,
        });

        levelIndices.set(level, currentIndex + 1);
      });
    });
  }

  return positions;
};

const getToolsForStep = (step: Step) => {
  const text = (step.name + " " + (step.description || "")).toLowerCase();

  if (text.includes("weather")) {
    return [
      {
        id: "weather-api",
        name: "WeatherAPI",
        url: "http://api.weatherapi.com/v1/current.json",
        includeApiKey: true,
      },
    ];
  }

  if (text.includes("news")) {
    return [
      {
        id: "news-api",
        name: "NewsAPI",
        url: "https://newsapi.org/v2/everything",
        includeApiKey: true,
      },
    ];
  }

  return [];
};

const getDefaultAgentConfig = (step: Step) => {
  const agentName = step.agent?.name || step.name || "Agent";
  const tools = getToolsForStep(step);

  return {
    systemPrompt: `
You are an AI agent.

Role: ${agentName}
Task: ${step.description || step.name || "Execute the given task"}

Rules:
- Do NOT ask questions to the user
- Use given input and context
- Produce final output
- Be concise and task-oriented
    `.trim(),
    primaryAgentName: agentName,
    agents: [
      {
        id: agentName,
        name: agentName,
        tools: tools.map((t: any) => t.id),
        instruction: step.agent?.instruction || "",
      },
    ],
    tools: tools,
  };
};

const createNodeFromStep = (
  step: Step,
  position: NodePosition
): Node => {
  const nodeType = mapStepTypeToNodeType(step.type);

  const nodeData = {
    label: step.name,
    description: step.description,
    type: step.type,
    bgColor: getNodeColor(step.type),
    id: step.id,
    settings: {
      name: step.name,
      instructions: step.agent?.instruction || "",
      outputFormat: step.agent?.outputFormat || "text",
      ...step.config,
    },
    agent: step.agent,
    agentConfig: getDefaultAgentConfig(step),
    dependencies: step.dependencies,
    next: step.next,
  };

  return {
    id: step.id,
    type: nodeType,
    position,
    data: nodeData,
  };
};

const getNodeColor = (stepType: string): string => {
  const colorMap: Record<string, string> = {
    Planner: "#DCF7E3",
    Researcher: "#E3F2FD",
    Executor: "#D1F0FF",
    Reviewer: "#EADCFF",
    API: "#D1F0FF",
    Approval: "#EADCFF",
    Condition: "#FFF3CD",
    Loop: "#E3F2FD",
    End: "#FEE3E3",
    Analyzer: "#E8F5E9",
    ContentGenerator: "#F3E5F5",
    Optimizer: "#FFF8E1",
    Personalizer: "#E0F7FA",
    Predictor: "#FCE4EC",
    Action: "#D4EDDA",
    SymptomExtractor: "#FFD6D6",
    PatternAnalyzer: "#FFE4CC",
    RiskFlagger: "#FFECEC",
    RecommendationProvider: "#E8F5E9",
    GoalAnalyzer: "#E3FCFD",
    StudyPlanGenerator: "#E8F5E9",
    PlanOptimizer: "#F0FFF4",
    ConceptRecommender: "#F3E5F5",
    ErrorAnalyzer: "#FFE4E4",
    RootCauseAnalyzer: "#FFF3E0",
    FixGenerator: "#E8F5E9",
    TravelAnalyzer: "#E0F7FA",
    TavilySearch: "#E8F5E9",
    ItineraryGenerator: "#F3E5F5",
    BudgetPlanner: "#FFF8E1",
    TravelTips: "#FCE4EC",
  };

  return colorMap[stepType] || "#DCF7E3";
};

const createEdgeFromDependency = (
  sourceId: string,
  targetId: string,
  isSuccess: boolean = true
): Edge => {
  return {
    id: `edge-${sourceId}-${targetId}`,
    source: sourceId,
    target: targetId,
    sourceHandle: isSuccess ? "out" : "failure",
    targetHandle: "in",
    animated: true,
    style: {
      stroke: isSuccess ? "#22c55e" : "#ef4444",
      strokeWidth: 2,
    },
  };
};

const createEdgesFromNext = (steps: Step[]): Edge[] => {
  const edges: Edge[] = [];
  const stepMap = new Map(steps.map((s) => [s.id, s]));

  steps.forEach((step) => {
    if (step.next?.success) {
      const targetExists = stepMap.has(step.next.success);
      if (targetExists) {
        edges.push(
          createEdgeFromDependency(step.id, step.next.success, true)
        );
      }
    }

    if (step.next?.failure) {
      const targetExists = stepMap.has(step.next.failure);
      if (targetExists) {
        edges.push(
          createEdgeFromDependency(step.id, step.next.failure, false)
        );
      }
    }
  });

  return edges;
};

const createEdgesFromDependencies = (
  steps: Step[],
  dependencies: Record<string, string[]>
): Edge[] => {
  const edges: Edge[] = [];
  const stepIds = new Set(steps.map((s) => s.id));

  Object.entries(dependencies).forEach(([targetId, sourceIds]) => {
    if (!stepIds.has(targetId)) return;

    sourceIds.forEach((sourceId) => {
      if (!stepIds.has(sourceId)) return;

      edges.push({
        id: `edge-${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        sourceHandle: "out",
        targetHandle: "in",
        animated: true,
        style: {
          stroke: "#94a3b8",
          strokeWidth: 2,
          strokeDasharray: "5,5",
        },
      });
    });
  });

  return edges;
};

export interface ConvertWorkflowOptions {
  layoutDirection?: LayoutDirection["type"];
  preservePositions?: boolean;
}

export const convertWorkflowToFlow = (
  workflow: WorkflowResult,
  options: ConvertWorkflowOptions = {}
): FlowData => {
  const { layoutDirection = "vertical", preservePositions = false } = options;

  if (!workflow || !workflow.steps || !Array.isArray(workflow.steps)) {
    console.warn("Invalid workflow data provided to convertWorkflowToFlow");
    return { nodes: [], edges: [] };
  }

  const dependencies = workflow.dependencies || {};

  let nodePositions: Map<string, NodePosition> = new Map();

  if (preservePositions) {
    workflow.steps.forEach((step) => {
      if (step.config?.position) {
        nodePositions.set(step.id, step.config.position);
      }
    });
  }

  if (!preservePositions || nodePositions.size === 0) {
    nodePositions = calculateNodePositions(
      workflow.steps,
      dependencies,
      layoutDirection
    );
  }

  const nodes: Node[] = workflow.steps.map((step) => {
    const position = nodePositions.get(step.id) || { x: 0, y: 0 };
    return createNodeFromStep(step, position);
  });

  let edges = createEdgesFromNext(workflow.steps);

  const dependencyEdges = createEdgesFromDependencies(
    workflow.steps,
    dependencies
  );

  const existingEdgeIds = new Set(edges.map((e) => e.id));
  dependencyEdges.forEach((edge) => {
    if (!existingEdgeIds.has(edge.id)) {
      edges.push(edge);
    }
  });

  // Add Start node at the beginning
  const layout = DEFAULT_LAYOUT_OPTIONS[layoutDirection];
  const startNode: Node = {
    id: "start-node",
    type: "StartNode",
    position: {
      x: layout.startX - layout.levelSpacing,
      y: layout.startY,
    },
    data: {
      label: "Start",
      type: "Start",
      bgColor: "#DCF7E3",
    },
  };

  // Shift all nodes to the right to make room for Start node
  const shiftedNodes = nodes.map((node) => ({
    ...node,
    position: {
      x: node.position.x + layout.levelSpacing,
      y: node.position.y,
    },
  }));

  // Connect Start node to the first step
  const firstStepId = workflow.steps[0]?.id;
  const startEdge: Edge | null = firstStepId
    ? {
        id: `edge-start-${firstStepId}`,
        source: "start-node",
        target: firstStepId,
        sourceHandle: "out",
        targetHandle: "in",
        animated: true,
        style: {
          stroke: "#22c55e",
          strokeWidth: 2,
        },
      }
    : null;

  const finalEdges: Edge[] = startEdge ? [startEdge, ...edges] : edges;

  return {
    nodes: [startNode, ...shiftedNodes],
    edges: finalEdges,
  };
};

export const convertStepsToFlow = (
  steps: Step[],
  options: ConvertWorkflowOptions = {}
): FlowData => {
  const { layoutDirection = "vertical" } = options;

  if (!steps || !Array.isArray(steps)) {
    console.warn("Invalid steps data provided to convertStepsToFlow");
    return { nodes: [], edges: [] };
  }

  const dependencies: Record<string, string[]> = {};
  steps.forEach((step) => {
    if (step.dependencies && step.dependencies.length > 0) {
      dependencies[step.id] = step.dependencies;
    }
  });

  const nodePositions = calculateNodePositions(
    steps,
    dependencies,
    layoutDirection
  );

  const nodes: Node[] = steps.map((step) => {
    const position = nodePositions.get(step.id) || { x: 0, y: 0 };
    return createNodeFromStep(step, position);
  });

  const edges = createEdgesFromNext(steps);

  const dependencyEdges = createEdgesFromDependencies(steps, dependencies);
  const existingEdgeIds = new Set(edges.map((e) => e.id));
  dependencyEdges.forEach((edge) => {
    if (!existingEdgeIds.has(edge.id)) {
      edges.push(edge);
    }
  });

  return {
    nodes,
    edges,
  };
};

export const addPositionsToNodes = (
  nodes: Node[],
  direction: LayoutDirection["type"] = "vertical"
): Node[] => {
  const layout = DEFAULT_LAYOUT_OPTIONS[direction];

  if (direction === "horizontal") {
    return nodes.map((node, index) => ({
      ...node,
      position: {
        x: layout.startX + Math.floor(index / 3) * layout.spacing,
        y: layout.startY + (index % 3) * 100,
      },
    }));
  } else {
    return nodes.map((node, index) => ({
      ...node,
      position: {
        x: layout.startX,
        y: layout.startY + index * layout.spacing,
      },
    }));
  }
};

export const getFlowMetadata = (flowData: FlowData) => {
  const nodesByType: Record<string, number> = {};
  let maxX = 0;
  let maxY = 0;
  let minX = Infinity;
  let minY = Infinity;

  flowData.nodes.forEach((node) => {
    const type = (node.data?.type as string) || "Unknown";
    nodesByType[type] = (nodesByType[type] || 0) + 1;

    maxX = Math.max(maxX, node.position.x);
    maxY = Math.max(maxY, node.position.y);
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
  });

  return {
    totalNodes: flowData.nodes.length,
    totalEdges: flowData.edges.length,
    nodesByType,
    boundingBox: {
      width: maxX - minX,
      height: maxY - minY,
      minX,
      minY,
      maxX,
      maxY,
    },
    hasCycles: detectCycles(flowData.edges),
  };
};

const detectCycles = (edges: Edge[]): boolean => {
  const adjacencyList = new Map<string, string[]>();

  edges.forEach((edge) => {
    if (!adjacencyList.has(edge.source)) {
      adjacencyList.set(edge.source, []);
    }
    adjacencyList.get(edge.source)!.push(edge.target);
  });

  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const hasCycleDFS = (node: string): boolean => {
    visited.add(node);
    recursionStack.add(node);

    const neighbors = adjacencyList.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycleDFS(neighbor)) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(node);
    return false;
  };

  for (const node of Array.from(adjacencyList.keys())) {
    if (!visited.has(node)) {
      if (hasCycleDFS(node)) {
        return true;
      }
    }
  }

  return false;
};

export default convertWorkflowToFlow;
