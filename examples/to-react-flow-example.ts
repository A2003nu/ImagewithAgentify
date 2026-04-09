/**
 * React Flow Converter - Example Usage
 */

import type { WorkflowResult } from "@/types/WorkflowType";
import { convertWorkflowToFlow } from "@/lib/workflow";

// Example workflow
const sampleWorkflow: WorkflowResult = {
  workflowName: "Research AI News",
  description: "Research and summarize AI news",
  goal: "Research and summarize the latest AI news about machine learning",
  steps: [
    {
      id: "step-1",
      name: "Plan Research",
      type: "Planner",
      description: "Create a research plan and identify key topics",
      dependencies: [],
      next: { success: "step-2", failure: null },
      config: {},
    },
    {
      id: "step-2",
      name: "Gather Information",
      type: "Researcher",
      description: "Search for relevant AI news sources",
      dependencies: ["step-1"],
      next: { success: "step-3", failure: null },
      config: {},
    },
    {
      id: "step-3",
      name: "Execute Analysis",
      type: "Executor",
      description: "Analyze gathered information",
      dependencies: ["step-2"],
      next: { success: "step-4", failure: null },
      config: {},
    },
    {
      id: "step-4",
      name: "Review Results",
      type: "Reviewer",
      description: "Validate analysis and ensure quality",
      dependencies: ["step-3"],
      next: { success: "step-5", failure: null },
      config: {},
    },
    {
      id: "step-5",
      name: "Complete",
      type: "End",
      description: "Finalize and present results",
      dependencies: ["step-4"],
      next: { success: null, failure: null },
      config: {},
    },
  ],
  agents: [
    {
      id: "planner",
      name: "Planner",
      role: "Strategic planning",
      capabilities: ["Goal decomposition", "Task prioritization"],
      tools: [],
      model: "llama-3.3-70b-versatile",
      systemPrompt: "You are a strategic planner.",
    },
  ],
  tools: [],
  dependencies: {
    "step-2": ["step-1"],
    "step-3": ["step-2"],
    "step-4": ["step-3"],
    "step-5": ["step-4"],
  },
  estimatedComplexity: "medium",
  estimatedSteps: 5,
};

// Example 1: Basic conversion
function example1() {
  console.log("Example 1: Basic Conversion");
  console.log("=".repeat(50));

  const { nodes, edges } = convertWorkflowToFlow(sampleWorkflow);

  console.log(`Generated ${nodes.length} nodes`);
  console.log(`Generated ${edges.length} edges`);

  console.log("\nNodes:");
  nodes.forEach((node) => {
    console.log(`  - ${node.id} (${node.type}) at (${node.position.x}, ${node.position.y})`);
  });

  console.log("\nEdges:");
  edges.forEach((edge) => {
    console.log(`  - ${edge.source} → ${edge.target} [${edge.sourceHandle}]`);
  });
}

// Example 2: Horizontal layout
function example2() {
  console.log("\n\nExample 2: Horizontal Layout");
  console.log("=".repeat(50));

  const { nodes, edges } = convertWorkflowToFlow(sampleWorkflow, {
    layoutDirection: "horizontal",
  });

  console.log(`Generated ${nodes.length} nodes`);
  console.log(`Generated ${edges.length} edges`);

  console.log("\nNodes (horizontal):");
  nodes.forEach((node) => {
    console.log(`  - ${node.id} at (${node.position.x}, ${node.position.y})`);
  });
}

// Example 3: With metadata
function example3() {
  console.log("\n\nExample 3: Get Flow Metadata");
  console.log("=".repeat(50));

  const { convertWorkflowToFlow, getFlowMetadata } = require("@/lib/workflow");

  const { nodes, edges } = convertWorkflowToFlow(sampleWorkflow);
  const metadata = getFlowMetadata({ nodes, edges });

  console.log("Flow Metadata:");
  console.log(`  Total Nodes: ${metadata.totalNodes}`);
  console.log(`  Total Edges: ${metadata.totalEdges}`);
  console.log(`  Has Cycles: ${metadata.hasCycles}`);
  console.log("\n  Nodes by Type:");
  Object.entries(metadata.nodesByType).forEach(([type, count]) => {
    console.log(`    - ${type}: ${count}`);
  });
  console.log("\n  Bounding Box:");
  console.log(`    Width: ${metadata.boundingBox.width}`);
  console.log(`    Height: ${metadata.boundingBox.height}`);
}

// Example 4: React Flow integration
function example4() {
  console.log("\n\nExample 4: React Flow Integration");
  console.log("=".repeat(50));

  const { nodes, edges } = convertWorkflowToFlow(sampleWorkflow);

  // This is how you would use it in a React component
  const reactFlowComponent = `
import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes } from "./your-node-types";

function WorkflowViewer() {
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
`;

  console.log("React Flow Component Example:");
  console.log(reactFlowComponent);
}

// Example 5: With custom positions
function example5() {
  console.log("\n\nExample 5: Preserve Custom Positions");
  console.log("=".repeat(50));

  const workflowWithPositions: WorkflowResult = {
    ...sampleWorkflow,
    steps: [
      {
        ...sampleWorkflow.steps[0],
        config: {
          position: { x: 100, y: 200 },
        },
      },
      {
        ...sampleWorkflow.steps[1],
        config: {
          position: { x: 400, y: 200 },
        },
      },
    ],
  };

  const { nodes, edges } = convertWorkflowToFlow(workflowWithPositions, {
    preservePositions: true,
  });

  console.log(`Generated ${nodes.length} nodes with custom positions`);

  nodes.forEach((node) => {
    console.log(
      `  - ${node.id} at (${node.position.x}, ${node.position.y})`
    );
  });
}

// Example 6: Error handling
function example6() {
  console.log("\n\nExample 6: Error Handling");
  console.log("=".repeat(50));

  const invalidWorkflow = {
    steps: [], // Empty workflow
  } as any;

  const { nodes, edges } = convertWorkflowToFlow(invalidWorkflow);

  console.log(`Result: ${nodes.length} nodes, ${edges.length} edges`);

  if (nodes.length === 0) {
    console.log("⚠️ No nodes generated - workflow may be invalid");
  }
}

// Run all examples
function runExamples() {
  console.log("\n🚀 React Flow Converter Examples");
  console.log("=".repeat(60));
  console.log(`Workflow: ${sampleWorkflow.workflowName}`);
  console.log(`Steps: ${sampleWorkflow.steps.length}`);
  console.log("=".repeat(60));

  try {
    example1();
    example2();
    example3();
    example4();
    example5();
    example6();
  } catch (error) {
    console.error("Error running examples:", error);
  }

  console.log("\n\n✅ All examples completed!");
}

// Export functions for module usage
export {
  convertWorkflowToFlow,
  example1,
  example2,
  example3,
  example4,
  example5,
  example6,
  runExamples,
};

// Run examples if executed directly
if (require.main === module) {
  runExamples();
}
