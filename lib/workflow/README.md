# Auto Workflow Generator Module

## 📋 Overview

The Auto Workflow Generator is a modular feature that transforms natural language goals into structured, executable workflow JSON configurations using AI.

## 🎯 Purpose

This module enables users to describe what they want to accomplish in plain language, and the system automatically generates a complete workflow with:
- Specialized AI agents
- Ordered execution steps
- Tool configurations
- Dependencies and control flow
- Quality validation

## 🏗️ Architecture

```
lib/workflow/
├── index.ts              # Module exports
├── validator.ts          # Workflow validation & enrichment
└── helpers.ts            # Workflow manipulation utilities

types/
└── WorkflowType.ts       # TypeScript type definitions

app/api/
└── auto-workflow/
    └── route.ts          # API endpoints (GET docs, POST generate)

docs/
└── AUTO_WORKFLOW_API.md # Detailed API documentation

examples/
└── auto-workflow-example.ts # Usage examples
```

## 🚀 Quick Start

### 1. Generate a Workflow

```typescript
const response = await fetch('/api/auto-workflow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    goal: 'Research and summarize AI news',
    options: {
      complexity: 'medium',
      context: 'Focus on machine learning'
    }
  })
});

const { workflow, success } = await response.json();
```

### 2. Validate a Workflow

```typescript
import { validateWorkflow } from '@/lib/workflow';

const validation = validateWorkflow(myWorkflow);
if (validation.isValid) {
  console.log('Workflow is valid!');
} else {
  console.log('Errors:', validation.errors);
  console.log('Warnings:', validation.warnings);
}
```

### 3. Convert to React Flow

```typescript
import { convertWorkflowToReactFlow } from '@/lib/workflow';

const { nodes, edges } = convertWorkflowToReactFlow(workflow);
// Use nodes and edges with React Flow
```

## 📦 Core Features

### 1. AI-Powered Generation
- Uses Groq LLM (llama-3.3-70b-versatile)
- Generates multi-agent workflows
- Supports complex control flow (conditionals, loops)
- Configurable complexity levels

### 2. Agent System
Four specialized agent types:
- **Planner**: Strategic planning and task decomposition
- **Researcher**: Information gathering and validation
- **Executor**: Task execution and API integration
- **Reviewer**: Quality assurance and validation

### 3. Step Types
- `Planner`: Initial analysis and planning
- `Researcher`: Information gathering
- `Executor`: Main task execution
- `Reviewer`: Validation and quality checks
- `Condition`: Branching logic (if/else)
- `Loop`: Repetitive tasks
- `API`: External API calls
- `Approval`: Human-in-the-loop checkpoints
- `End`: Workflow completion

### 4. Tool Types
- `api`: External HTTP API calls
- `function`: Custom functions/code
- `condition`: Conditional logic
- `formatter`: Output formatting

### 5. Validation & Enrichment
- Structural validation
- Dependency verification
- Automatic enrichment with defaults
- Warning generation for best practices

## 🔧 API Reference

### POST `/api/auto-workflow`

Generate a workflow from a natural language goal.

**Request Body:**
```typescript
{
  goal: string;                    // Required: The user's goal
  options?: {
    context?: string;              // Additional context
    complexity?: 'low' | 'medium' | 'high' | 'auto';
    maxSteps?: number;            // Maximum number of steps
    preferredTools?: string[];    // Preferred tool names
  }
}
```

**Response:**
```typescript
{
  success: boolean;
  workflow?: {
    workflowName: string;
    description: string;
    goal: string;
    steps: Step[];
    agents: Agent[];
    tools: Tool[];
    dependencies: Record<string, string[]>;
    estimatedComplexity: 'low' | 'medium' | 'high';
    estimatedSteps: number;
  };
  metadata?: {
    generatedAt: string;
    model: string;
    validation: {
      isValid: boolean;
      errors: string[];
      warnings: string[];
    };
  };
  error?: string;
  details?: string;
}
```

### GET `/api/auto-workflow`

Get API documentation and usage examples.

## 📖 Usage Examples

### Example 1: Simple Workflow
```typescript
const result = await generateWorkflow(
  "Send a daily weather report to my email",
  { complexity: "low" }
);
```

### Example 2: Research Workflow
```typescript
const result = await generateWorkflow(
  "Research and summarize the latest AI news",
  {
    context: "Focus on machine learning developments",
    complexity: "medium",
  }
);
```

### Example 3: Complex Monitoring System
```typescript
const result = await generateWorkflow(
  "Monitor competitor prices and alert me on significant changes",
  {
    complexity: "high",
    maxSteps: 12,
  }
);
```

## 🔍 Validation

The validation system checks for:

### Required Fields
- ✅ `workflowName`: Must be a string
- ✅ `goal`: Must be a string
- ✅ `steps`: Must be a non-empty array
- ✅ `agents`: Must be an array
- ✅ `tools`: Must be an array

### Step Validation
- ✅ Valid step IDs
- ✅ No duplicate IDs
- ✅ Valid step types
- ✅ Dependencies reference existing steps
- ✅ No circular dependencies
- ✅ Valid next/failure references

### Agent Validation
- ✅ Valid agent IDs
- ✅ Valid agent types
- ✅ All agents are used in steps
- ✅ System prompts present

### Tool Validation
- ✅ Valid tool IDs
- ✅ Valid tool types
- ✅ All tools are used by agents or steps

## 🛠️ Utilities

### Workflow Manipulation
```typescript
import {
  createEmptyWorkflow,
  createStep,
  createAgent,
  createTool,
  addStepToWorkflow,
  removeStepFromWorkflow,
  updateStepInWorkflow,
  addDependency,
  removeDependency,
} from '@/lib/workflow';
```

### Analysis
```typescript
import {
  getStepDependencies,
  getStepDependents,
  detectCircularDependencies,
  calculateWorkflowMetrics,
} from '@/lib/workflow';
```

### Import/Export
```typescript
import {
  cloneWorkflow,
  exportWorkflowToJSON,
  importWorkflowFromJSON,
} from '@/lib/workflow';

// Export
const json = exportWorkflowToJSON(workflow);

// Import
const workflow = importWorkflowFromJSON(json);
```

## 🎨 Integration with Agent Builder

The generated workflow can be converted to React Flow format:

```typescript
import { convertWorkflowToReactFlow } from '@/lib/workflow';

const { nodes, edges } = convertWorkflowToReactFlow(workflow);

// Use with React Flow
<ReactFlow nodes={nodes} edges={edges} />
```

## 📊 Workflow Metrics

Calculate comprehensive metrics:

```typescript
import { calculateWorkflowMetrics } from '@/lib/workflow';

const metrics = calculateWorkflowMetrics(workflow);
console.log(metrics);
// {
//   totalSteps: 5,
//   totalAgents: 4,
//   totalTools: 3,
//   maxDepth: 3,
//   hasConditionals: true,
//   hasLoops: false,
//   hasApprovals: true,
//   estimatedComplexity: 'medium'
// }
```

## 🔄 Workflow Lifecycle

1. **Generation**: Create workflow from goal (POST /api/auto-workflow)
2. **Validation**: Validate structure and dependencies
3. **Enrichment**: Add defaults and normalize data
4. **Manipulation**: Edit workflow using helpers
5. **Conversion**: Convert to React Flow for visualization
6. **Export**: Save as JSON or integrate into Agent Builder

## ⚡ Performance

- Generation typically takes 2-5 seconds
- Validation is immediate (<100ms)
- React Flow conversion is immediate (<50ms)

## 🐛 Error Handling

Common errors and solutions:

1. **"Goal is required"**
   - Solution: Include `goal` in request body

2. **"Failed to extract JSON from LLM response"**
   - Solution: Retry the request

3. **"Generated workflow validation failed"**
   - Solution: Check `validation.errors` array

## 🚧 Future Enhancements

- [ ] UI integration with Agent Builder
- [ ] Workflow templates library
- [ ] Cost estimation
- [ ] Version history
- [ ] Multi-turn conversation context
- [ ] Custom agent templates
- [ ] Workflow optimization suggestions

## 📝 Best Practices

1. **Clear Goals**: Be specific about what you want to achieve
2. **Provide Context**: Add context for more accurate workflows
3. **Review Validation**: Always check validation warnings
4. **Test Simple First**: Start with low complexity, increase as needed
5. **Iterate**: Refine workflows based on results

## 🤝 Contributing

When extending this module:
1. Follow existing type definitions
2. Add comprehensive validation
3. Include usage examples
4. Update documentation
5. Test with various inputs

## 📄 License

Part of the Agentify platform - All rights reserved
