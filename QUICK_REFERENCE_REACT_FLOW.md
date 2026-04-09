# Quick Reference: React Flow Converter

## 📦 Import

```typescript
import { convertWorkflowToFlow } from "@/lib/workflow";
```

## 🚀 Basic Usage

```typescript
const workflow = await fetch("/api/auto-workflow", {
  method: "POST",
  body: JSON.stringify({ goal: "Research AI news" })
}).then(r => r.json());

const { nodes, edges } = convertWorkflowToFlow(workflow.workflow);
```

## 🎨 React Flow Integration

```typescript
<ReactFlow
  nodes={nodes}
  edges={edges}
  nodeTypes={nodeTypes}
  fitView
>
  <Controls />
  <Background />
</ReactFlow>
```

## ⚙️ Options

```typescript
convertWorkflowToFlow(workflow, {
  layoutDirection: "vertical" | "horizontal",
  preservePositions: boolean
});
```

## 🔧 Helper Functions

```typescript
// Convert steps only
convertStepsToFlow(steps)

// Add positions to nodes
addPositionsToNodes(nodes, "vertical")

// Get metadata
getFlowMetadata({ nodes, edges })
```

## 📊 Return Structure

```typescript
{
  nodes: [
    {
      id: "step-1",
      type: "AgentNode",
      position: { x: 400, y: 100 },
      data: {
        label: "Planner",
        description: "...",
        type: "Planner",
        settings: {...},
        agent: {...},
        dependencies: [],
        next: { success: "step-2", failure: null }
      }
    }
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
    }
  ]
}
```

## 🎯 Node Type Mapping

| Step | Node | Color |
|------|------|-------|
| Planner | AgentNode | 🟢 |
| Researcher | AgentNode | 🔵 |
| Executor | AgentNode | 🔷 |
| Reviewer | AgentNode | 🟣 |
| API | ApiNode | 🔷 |
| Approval | UserApprovalNode | 🟣 |
| Condition | IfElseNode | 🟡 |
| Loop | WhileNode | 🔵 |
| End | EndNode | 🔴 |

## ✅ Checklist

- [x] New file: `lib/workflow/toReactFlow.ts`
- [x] Export: `convertWorkflowToFlow`
- [x] Returns: `{ nodes: [], edges: [] }`
- [x] Each step → one node
- [x] Uses step.id as node.id
- [x] Positions calculated
- [x] Edges based on dependencies
- [x] Metadata preserved
- [x] NO existing files modified

## 📖 Docs

- **Guide**: `lib/workflow/REACT_FLOW_GUIDE.md`
- **Examples**: `examples/to-react-flow-example.ts`
- **Summary**: `REACT_FLOW_CONVERTER_SUMMARY.md`

## 💡 Tips

1. Use `fitView` to auto-fit all nodes
2. Include your `nodeTypes` for custom nodes
3. Check `nodes.length > 0` before rendering
4. Set `preservePositions: true` for custom positions
5. Use `getFlowMetadata()` for analytics

## 🔄 Complete Example

```typescript
import { ReactFlow } from "@xyflow/react";
import { convertWorkflowToFlow } from "@/lib/workflow";
import { nodeTypes } from "./your-node-types";

export default function WorkflowViewer({ workflow }) {
  const { nodes, edges } = convertWorkflowToFlow(workflow);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
    >
      <Controls />
      <Background />
    </ReactFlow>
  );
}
```

---

**Status**: ✅ Complete
**File**: `lib/workflow/toReactFlow.ts`
**Function**: `convertWorkflowToFlow(workflow, options)`
