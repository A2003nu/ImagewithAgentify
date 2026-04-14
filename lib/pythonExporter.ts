/**
 * Python Exporter Utility
 * Generates executable Python code from React Flow workflow nodes
 * Uses Groq SDK for agent execution and Pollinations API for images
 */

interface FlowNode {
  id: string;
  type?: string;
  data?: {
    label?: string;
    name?: string;
    prompt?: string;
    instruction?: string;
    systemPrompt?: string;
    url?: string;
    [key: string]: any;
  };
}

interface FlowEdge {
  source: string;
  target: string;
  [key: string]: any;
}

/**
 * Build dependency graph from edges
 * @param {Array<FlowEdge>} edges - Array of edge objects with source and target
 * @returns {Record<string, string[]>} - Dependency map { nodeId: [dependencyIds] }
 */
export function buildDependencyGraph(edges: FlowEdge[]): Record<string, string[]> {
  const dependencies: Record<string, string[]> = {};
  
  for (const edge of edges) {
    if (!edge.source || !edge.target) continue;
    const target = edge.target;
    const source = edge.source;
    
    if (!dependencies[target]) {
      dependencies[target] = [];
    }
    dependencies[target].push(source);
  }
  
  return dependencies;
}

/**
 * Topological sort using Kahn's Algorithm
 * @param {Array<FlowNode>} nodes - Array of node objects
 * @param {Record<string, string[]>} dependencies - Dependency graph
 * @returns {string[]} - Sorted node IDs in execution order
 */
export function topologicalSort(nodes: FlowNode[], dependencies: Record<string, string[]>): string[] {
  const inDegree: Record<string, number> = {};
  const nodeMap: Record<string, FlowNode> = {};
  
  // Initialize
  for (const node of nodes) {
    nodeMap[node.id] = node;
    inDegree[node.id] = 0;
  }
  
  // Calculate in-degrees
  for (const nodeId of Object.keys(dependencies)) {
    const deps = dependencies[nodeId];
    if (deps) {
      inDegree[nodeId] = deps.length;
    }
  }
  
  // Queue for nodes with no dependencies
  const queue: string[] = [];
  for (const nodeId of Object.keys(inDegree)) {
    if (inDegree[nodeId] === 0) {
      queue.push(nodeId);
    }
  }
  
  const sorted: string[] = [];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);
    
    // Reduce in-degree for all nodes that depend on current
    for (const [nodeId, deps] of Object.entries(dependencies)) {
      if (deps && deps.includes(current)) {
        inDegree[nodeId]--;
        if (inDegree[nodeId] === 0) {
          queue.push(nodeId);
        }
      }
    }
  }
  
  // Check for circular dependencies - fallback to original order
  if (sorted.length !== nodes.length) {
    return nodes.map(n => n.id); // Fallback to original order
  }
  
  return sorted;
}

/**
 * Get node label safely
 */
function getNodeLabel(node: FlowNode): string {
  return node.data?.label || node.data?.name || node.id || "Unnamed";
}

/**
 * Get node prompt/instruction safely
 */
function getNodePrompt(node: FlowNode): string {
  return node.data?.prompt || node.data?.instruction || node.data?.systemPrompt || "";
}

/**
 * Get node type
 */
function getNodeType(node: FlowNode): string {
  return node.type || "agent";
}

/**
 * Generate Python code for a single node
 */
function generateNodeFunction(node: FlowNode, index: number): string {
  const nodeId = node.id;
  const label = getNodeLabel(node);
  const prompt = getNodePrompt(node);
  const nodeType = getNodeType(node);
  
  // Sanitize for Python function name
  const safeLabel = label.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
  const funcName = `${nodeType}_${safeLabel}_${index}`;
  
  // Handle different node types
  if (nodeType === "api") {
    const apiUrl = node.data?.url || "";
    
    // Check if it's image generation API
    if (apiUrl.includes("pollinations")) {
      return `def ${funcName}(input_text):
    """${label} - API Node (Image Generation)"""
    prompt = input_text.strip().replace(" ", "%20")
    url = f"https://image.pollinations.ai/prompt/{prompt}"
    return url`;
    }
    
    // Generic API node
    return `def ${funcName}(input_text):
    """${label} - API Node"""
    # TODO: Configure API endpoint
    url = "${apiUrl || "https://api.example.com"}"
    return f"{url}?q={input_text}"`;
  }
  
  // Agent node (default)
  const escapedPrompt = prompt.replace(/"/g, '\\"').replace(/\n/g, '\\n');
  
  return `def ${funcName}(input_text):
    """${label} - Agent Node"""
    prompt = f"""${escapedPrompt}
    
Input: {input_text}"""
    
    response = client.chat.completions.create(
        model="llama3-70b-8192",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=1024
    )
    
    return response.choices[0].message.content`;
}

/**
 * Generate the complete Python script
 * @param {Array<FlowNode>} nodes - React Flow nodes
 * @param {Array<FlowEdge>} edges - React Flow edges
 * @returns {string} - Complete Python code
 */
export function generatePythonCode(nodes: FlowNode[], edges: FlowEdge[]): string {
  // Handle empty nodes
  if (!nodes || nodes.length === 0) {
    return `# Agentify Workflow Export
# No nodes found in workflow

def main():
    print("Error: No workflow nodes found")
    
if __name__ == "__main__":
    main()
`;
  }
  
  // Build dependency graph
  const dependencies = buildDependencyGraph(edges);
  
  // Get execution order
  const sortedIds = topologicalSort(nodes, dependencies);
  
  // Create node map for easy lookup
  const nodeMap: Record<string, FlowNode> = {};
  for (const node of nodes) {
    nodeMap[node.id] = node;
  }
  
  // Generate functions for each node
  const functions: string[] = [];
  for (let i = 0; i < sortedIds.length; i++) {
    const nodeId = sortedIds[i];
    const node = nodeMap[nodeId];
    functions.push(generateNodeFunction(node, i));
  }
  
  // Generate main execution logic
  const mainLines: string[] = [];
  mainLines.push("def main():");
  mainLines.push('    user_input = input("Enter input: ")');
  mainLines.push("    outputs = {}");
  mainLines.push("");
  
  // Generate execution for each node in order
  for (let i = 0; i < sortedIds.length; i++) {
    const nodeId = sortedIds[i];
    const node = nodeMap[nodeId];
    const label = getNodeLabel(node);
    const nodeType = getNodeType(node);
    const safeLabel = label.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    const funcName = `${nodeType}_${safeLabel}_${i}`;
    const nodeDeps = dependencies[nodeId] || [];
    
    mainLines.push(`    # Step ${i + 1}: ${label}`);
    if (nodeDeps.length > 0) {
      mainLines.push(`    # Depends on: ${nodeDeps.join(", ")}`);
    }
    mainLines.push("");
    
    if (nodeDeps.length === 0) {
      mainLines.push(`    try:`);
      mainLines.push(`        outputs["${nodeId}"] = ${funcName}(user_input)`);
      mainLines.push(`        print(f"✓ Step ${i + 1} (${label}): completed")`);
      mainLines.push(`    except Exception as e:`);
      mainLines.push(`        print(f"✗ Error in step ${i + 1} (${label}): {e}")`);
      mainLines.push(`        outputs["${nodeId}"] = None`);
    } else if (nodeDeps.length === 1) {
      mainLines.push(`    try:`);
      mainLines.push(`        input_val = outputs.get("${nodeDeps[0]}", user_input)`);
      mainLines.push(`        outputs["${nodeId}"] = ${funcName}(input_val)`);
      mainLines.push(`        print(f"✓ Step ${i + 1} (${label}): completed")`);
      mainLines.push(`    except Exception as e:`);
      mainLines.push(`        print(f"✗ Error in step ${i + 1} (${label}): {e}")`);
      mainLines.push(`        outputs["${nodeId}"] = None`);
    } else {
      mainLines.push(`    try:`);
      mainLines.push(`        input_val = "\\\\n".join([outputs.get(d, "") for d in ${JSON.stringify(nodeDeps)}])`);
      mainLines.push(`        outputs["${nodeId}"] = ${funcName}(input_val)`);
      mainLines.push(`        print(f"✓ Step ${i + 1} (${label}): completed")`);
      mainLines.push(`    except Exception as e:`);
      mainLines.push(`        print(f"✗ Error in step ${i + 1} (${label}): {e}")`);
      mainLines.push(`        outputs["${nodeId}"] = None`);
    }
    mainLines.push("");
  }
  
  // Final output
  const lastNodeId = sortedIds[sortedIds.length - 1];
  mainLines.push("    # Final output");
  mainLines.push(`    print(f"\\\\n=== Final Output ===")`);
  mainLines.push(`    print(outputs.get("${lastNodeId}", "No output"))`);
  
  // Build complete script
  const script = `# -*- coding: utf-8 -*-
"""
Agentify Workflow Export
Generated from Agentify AI Agent Builder
"""

from groq import Groq
import json

# Initialize Groq client
# Replace with your actual API key or set via environment variable
client = Groq(api_key="YOUR_GROQ_API_KEY")

# ============================================
# NODE FUNCTIONS
# ============================================

${functions.join("\n\n")}

# ============================================
# MAIN EXECUTION
# ============================================

${mainLines.join("\n")}

# Run the workflow
if __name__ == "__main__":
    main()
`;
  
  return script;
}

/**
 * Download Python file
 * @param {string} code - Python code
 * @param {string} filename - Output filename
 */
export function downloadPythonFile(code: string, filename: string = "agentify_workflow.py"): void {
  const blob = new Blob([code], { type: "text/x-python" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  
  URL.revokeObjectURL(url);
}