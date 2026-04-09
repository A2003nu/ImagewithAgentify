# React Flow Converter - Usage Guide

## Overview

The `convertWorkflowToFlow` utility converts auto-generated workflow JSON into React Flow nodes and edges format.

## Import

```typescript
import { convertWorkflowToFlow } from "@/lib/workflow";
// or
import { convertWorkflowToFlow } from "@/lib/workflow/toReactFlow";
```

## Basic Usage

```typescript
import type { WorkflowResult } from "@/types/WorkflowType";
import { convertWorkflowToFlow } from "@/lib/workflow";

const workflow: WorkflowResult = {
  workflowName: "My Workflow",
  steps: [
    {
      id: "step-1",
      name: "Planner",
      type: "Planner",
      description: "Create a plan",
      dependencies: [],
      next: { success: "step-2", failure: null },
      config: {}
    },
    {
      id: "step-2",
      name: "Executor",
      type: "Executor",
      description: "Execute tasks",
      dependencies: ["step-1"],
      next: { success: "step-3", failure: null },
      config: {}
    },
    {
      id: "step-3",
      name: "End",
      type: "End",
      description: "Complete workflow",
      dependencies: ["step-2"],
      next: { success: null, failure: null },
      config: {}
    }
  ],
  agents: [],
  tools: [],
  dependencies: {},
  estimatedComplexity: "low",
  estimatedSteps: 3,
  goal: "Test workflow",
  description: "A test workflow"
};

const { nodes, edges } = convertWorkflowToFlow(workflow);
```

## Output Structure

```typescript
{
  nodes: [
    {
      id: "step-1",
      type: "AgentNode",
      position: { x: 400, y: 100 },
      data: {
        label: "Planner",
        description: "Create a plan",
        type: "Planner",
        bgColor: "#DCF7E3",
        id: "step-1",
        settings: { name: "Planner", instructions: "", ... },
        agent: { ... },
        dependencies: [],
        next: { success: "step-2", failure: null }
      }
    },
    // ... more nodes
  ],
  edges: [
    {
      id: "edge-step-1-step-2",
      source: "step-1",
      target: "step-2",
      sourceHandle: "out",
      targetHandle: "in",
      animated: true,
      style: { stroke: "#22c55e", strokeWidth: 2 }
    },
    // ... more edges
  ]
}
```

## Options

```typescript
const options = {
  layoutDirection: "vertical" | "horizontal", // default: "vertical"
  preservePositions: boolean,                  // default: false
};

const { nodes, edges } = convertWorkflowToFlow(workflow, options);
```

### layoutDirection

Controls how nodes are positioned:

- **`"vertical"`** (default): Nodes arranged in columns, flows top-to-bottom
- **`"horizontal"`**: Nodes arranged in rows, flows left-to-right

### preservePositions

When `true`, uses positions from `step.config.position` if available. When `false` (default), calculates positions automatically.

## Node Type Mapping

Each step type maps to a React Flow node type:

| Step Type | Node Type |
|-----------|-----------|
| Planner | AgentNode |
| Researcher | AgentNode |
| Executor | AgentNode |
| Reviewer | AgentNode |
| API | ApiNode |
| Approval | UserApprovalNode |
| Condition | IfElseNode |
| Loop | WhileNode |
| End | EndNode |

## Edge Creation

Edges are created from:

1. **Next Success Path**: `step.next.success` creates a green animated edge
2. **Next Failure Path**: `step.next.failure` creates a red animated edge
3. **Dependencies**: `workflow.dependencies` creates gray dashed edges

## Position Calculation

Positions are calculated based on:

1. **Dependency Levels**: Nodes are grouped by dependency depth
2. **Layout Direction**: Nodes positioned vertically or horizontally
3. **Level Spacing**: Nodes on same level are spaced evenly

## Utility Functions

### `convertStepsToFlow`

Convert just steps without full workflow:

```typescript
import { convertStepsToFlow } from "@/lib/workflow/toReactFlow";

const { nodes, edges } = convertStepsToFlow(steps, { layoutDirection: "horizontal" });
```

### `addPositionsToNodes`

Add positions to existing nodes:

```typescript
import { addPositionsToNodes } from "@/lib/workflow/toReactFlow";

const positionedNodes = addPositionsToNodes(existingNodes, "vertical");
```

### `getFlowMetadata`

Get metadata about the flow:

```typescript
import { getFlowMetadata } from "@/lib/workflow/toReactFlow";

const metadata = getFlowMetadata({ nodes, edges });

// Returns:
// {
//   totalNodes: 5,
//   totalEdges: 4,
//   nodesByType: { Planner: 1, Executor: 2, End: 1, Reviewer: 1 },
//   boundingBox: { width: 600, height: 400, minX: 100, minY: 100, maxX: 700, maxY: 500 },
//   hasCycles: false
// }
```

## Example: Use with React Flow

```typescript
import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { convertWorkflowToFlow } from "@/lib/workflow";
import { nodeTypes } from "@/app/agent-builder/[agentId]/page"; // Your node types

function WorkflowViewer({ workflow }) {
  const { nodes: flowNodes, edges: flowEdges } = convertWorkflowToFlow(workflow);

  return (
    <ReactFlow
      nodes={flowNodes}
      edges={flowEdges}
      nodeTypes={nodeTypes}
      fitView
    >
      <Controls />
      <Background />
    </ReactFlow>
  );
}
```

## Example: Horizontal Layout

```typescript
const { nodes, edges } = convertWorkflowToFlow(workflow, {
  layoutDirection: "horizontal"
});
```

## Example: Preserve Custom Positions

```typescript
// Set custom positions in step config
const workflow = {
  ...,
  steps: [
    {
      id: "step-1",
      // ...
      config: {
        position: { x: 100, y: 200 }
      }
    }
  ]
};

const { nodes, edges } = convertWorkflowToFlow(workflow, {
  preservePositions: true
});
```

## Node Data Structure

Each node's `data` field contains:

```typescript
{
  label: string,           // Step name
  description: string,     // Step description
  type: string,            // Step type
  bgColor: string,         // Background color for node
  id: string,              // Step ID
  settings: {              // Settings for node configuration
    name: string,
    instructions: string,
    outputFormat: string,
    ...step.config
  },
  agent?: AgentConfig,     // Agent configuration if applicable
  dependencies: string[],  // Step dependencies
  next: {                  // Next steps
    success: string | null,
    failure: string | null
  }
}
```

## Edge Properties

Each edge has:

```typescript
{
  id: string,              // Unique edge ID
  source: string,          // Source node ID
  target: string,          // Target node ID
  sourceHandle: string,    // "out", "failure", "if", "else", etc.
  targetHandle: string,    // "in"
  animated: boolean,       // Animation enabled
  style: {                 // Visual styling
    stroke: string,        // Color
    strokeWidth: number,
    strokeDasharray?: string
  }
}
```

## Error Handling

```typescript
const { nodes, edges } = convertWorkflowToFlow(invalidWorkflow);

// Returns empty arrays if workflow is invalid:
// { nodes: [], edges: [] }

// Always check if arrays are not empty before rendering
if (nodes.length === 0) {
  return <div>No nodes to display</div>;
}
```

## TypeScript Support

All functions are fully typed:

```typescript
import type { WorkflowResult } from "@/types/WorkflowType";
import type { FlowData, ConvertWorkflowOptions } from "@/lib/workflow/toReactFlow";

const options: ConvertWorkflowOptions = {
  layoutDirection: "vertical",
  preservePositions: false
};

const flowData: FlowData = convertWorkflowToFlow(workflow, options);
```

## Best Practices

1. **Always use with nodeTypes**: Include your custom node types
2. **Fit view**: Use `fitView` prop to auto-fit all nodes
3. **Error handling**: Check for empty arrays
4. **Positioning**: Let the utility calculate positions, or set `preservePositions: true`
5. **Layout**: Choose appropriate layout direction for your use case

## Performance

- Position calculation: O(n log n)
- Edge creation: O(n + m) where m = number of dependencies
- Memory: O(n + m) where n = nodes, m = edges

For workflows with 100+ nodes, consider lazy loading or virtualizing.
