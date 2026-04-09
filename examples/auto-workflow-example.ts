/**
 * Auto Workflow Generator - Example Usage
 * 
 * This file demonstrates how to use the /api/auto-workflow endpoint
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

interface WorkflowOptions {
  context?: string;
  complexity?: "low" | "medium" | "high" | "auto";
  maxSteps?: number;
  preferredTools?: string[];
}

interface WorkflowResponse {
  success: boolean;
  workflow?: any;
  metadata?: any;
  error?: string;
  details?: string;
  warnings?: string[];
}

async function generateWorkflow(
  goal: string,
  options?: WorkflowOptions
): Promise<WorkflowResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auto-workflow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        goal,
        options,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to generate workflow",
        details: data.details,
        warnings: data.warnings,
      };
    }

    return {
      success: true,
      workflow: data.workflow,
      metadata: data.metadata,
    };
  } catch (error) {
    console.error("Error generating workflow:", error);
    return {
      success: false,
      error: "Network error",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function getApiDocumentation(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auto-workflow`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching API documentation:", error);
    return null;
  }
}

// Example usage:
async function example() {
  console.log("=== Auto Workflow Generator Examples ===\n");

  // Example 1: Simple workflow
  console.log("Example 1: Simple Weather Report Workflow");
  const simpleResult = await generateWorkflow(
    "Send a daily weather report to my email",
    { complexity: "low" }
  );

  if (simpleResult.success) {
    console.log("✓ Workflow generated successfully");
    console.log("  Name:", simpleResult.workflow?.workflowName);
    console.log("  Steps:", simpleResult.workflow?.estimatedSteps);
    console.log("  Complexity:", simpleResult.workflow?.estimatedComplexity);
    console.log("\n");
  } else {
    console.log("✗ Failed:", simpleResult.error);
    console.log("\n");
  }

  // Example 2: Medium complexity research workflow
  console.log("Example 2: Medium Research Workflow");
  const mediumResult = await generateWorkflow(
    "Research and summarize the latest AI news about machine learning",
    {
      context: "Focus on recent developments in the last week",
      complexity: "medium",
    }
  );

  if (mediumResult.success) {
    console.log("✓ Workflow generated successfully");
    console.log("  Name:", mediumResult.workflow?.workflowName);
    console.log("  Description:", mediumResult.workflow?.description);
    console.log("  Steps:", mediumResult.workflow?.estimatedSteps);
    console.log("  Agents:", mediumResult.workflow?.agents?.length);
    console.log("  Validation:", mediumResult.metadata?.validation?.isValid);
    console.log("\n");

    // Display workflow structure
    console.log("  Steps breakdown:");
    mediumResult.workflow?.steps?.forEach((step: any, index: number) => {
      console.log(`    ${index + 1}. [${step.type}] ${step.name}`);
      if (step.next?.success) {
        console.log(`       → Next: ${step.next.success}`);
      }
    });
    console.log("\n");
  } else {
    console.log("✗ Failed:", mediumResult.error);
    console.log("\n");
  }

  // Example 3: High complexity monitoring workflow
  console.log("Example 3: High Complexity Monitoring Workflow");
  const complexResult = await generateWorkflow(
    "Build an automated system that monitors competitor prices, analyzes trends, and alerts me when there's a significant price change",
    {
      complexity: "high",
      maxSteps: 12,
    }
  );

  if (complexResult.success) {
    console.log("✓ Workflow generated successfully");
    console.log("  Name:", complexResult.workflow?.workflowName);
    console.log("  Estimated Steps:", complexResult.workflow?.estimatedSteps);
    console.log("  Complexity:", complexResult.workflow?.estimatedComplexity);
    console.log("\n");

    // Display agents
    console.log("  Agents:");
    complexResult.workflow?.agents?.forEach((agent: any) => {
      console.log(`    - ${agent.name}: ${agent.role}`);
      console.log(`      Capabilities: ${agent.capabilities?.join(", ")}`);
    });
    console.log("\n");

    // Display tools
    if (complexResult.workflow?.tools?.length > 0) {
      console.log("  Tools:");
      complexResult.workflow?.tools?.forEach((tool: any) => {
        console.log(`    - ${tool.name} (${tool.type})`);
        console.log(`      ${tool.description}`);
      });
      console.log("\n");
    }
  } else {
    console.log("✗ Failed:", complexResult.error);
    if (complexResult.details) {
      console.log("  Details:", complexResult.details);
    }
    console.log("\n");
  }

  // Example 4: Workflow with warnings
  console.log("Example 4: Minimal Goal (may generate warnings)");
  const minimalResult = await generateWorkflow("Do something useful");

  if (minimalResult.success) {
    console.log("✓ Workflow generated");
    if (minimalResult.metadata?.validation?.warnings?.length > 0) {
      console.log("  Warnings:");
      minimalResult.metadata.validation.warnings.forEach((warning: string) => {
        console.log(`    ⚠ ${warning}`);
      });
    }
  } else {
    console.log("✗ Failed:", minimalResult.error);
  }

  console.log("\n=== Examples Complete ===");
}

// Export functions for use in other modules
export { generateWorkflow, getApiDocumentation };
export type { WorkflowOptions, WorkflowResponse };

// Run examples if executed directly
if (require.main === module) {
  example().catch(console.error);
}
