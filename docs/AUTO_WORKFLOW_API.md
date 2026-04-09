# Auto Workflow Generator API

## Overview

The Auto Workflow Generator API (`/api/auto-workflow`) is a new modular feature that generates structured workflow JSON based on natural language user goals.

## Features

- **Multi-Agent Workflow Generation**: Creates workflows with specialized agents (Planner, Researcher, Executor, Reviewer)
- **Flexible Step Types**: Supports various step types including planning, execution, validation, control flow, and approvals
- **Tool Integration**: Generates tool configurations for API calls, functions, conditions, and formatters
- **Workflow Validation**: Validates generated workflows for structure and consistency
- **Workflow Enrichment**: Enhances workflows with default values and proper dependencies

## Architecture

### Components

1. **API Route** (`/api/auto-workflow/route.ts`)
   - POST: Generate workflow from goal
   - GET: API documentation

2. **Type Definitions** (`/types/WorkflowType.ts`)
   - TypeScript interfaces for workflow components
   - Agent definitions and capabilities
   - Step type categories

3. **Validation Utilities** (`/lib/workflow-validator.ts`)
   - Workflow structure validation
   - Dependency verification
   - React Flow conversion
   - Workflow enrichment

## Usage

### Request

```typescript
POST /api/auto-workflow
Content-Type: application/json

{
  "goal": "Research and summarize the latest AI news",
  "options": {
    "context": "Focus on technology and machine learning",
    "complexity": "medium",
    "maxSteps": 10
  }
}
```

### Response

```typescript
{
  "success": true,
  "workflow": {
    "workflowName": "AI News Research Workflow",
    "description": "Automated workflow to research and summarize AI news",
    "goal": "Research and summarize the latest AI news",
    "steps": [
      {
        "id": "step-1",
        "name": "Plan Research Strategy",
        "type": "Planner",
        "description": "Create a research plan and identify key information sources",
        "agent": {
          "id": "planner",
          "name": "Planner",
          "instruction": "Break down the goal into research tasks",
          "tools": [],
          "model": "llama-3.3-70b-versatile",
          "outputFormat": "text"
        },
        "dependencies": [],
        "next": {
          "success": "step-2",
          "failure": null
        },
        "config": {}
      }
    ],
    "agents": [
      {
        "id": "planner",
        "name": "Planner",
        "role": "Strategic planning agent",
        "capabilities": ["Goal decomposition", "Task prioritization"],
        "tools": [],
        "model": "llama-3.3-70b-versatile",
        "systemPrompt": "You are a strategic planner..."
      }
    ],
    "tools": [],
    "dependencies": {},
    "estimatedComplexity": "medium",
    "estimatedSteps": 5
  },
  "metadata": {
    "generatedAt": "2026-03-24T10:00:00.000Z",
    "model": "llama-3.3-70b-versatile",
    "validation": {
      "isValid": true,
      "errors": [],
      "warnings": []
    }
  }
}
```

## Agent Types

### 1. Planner
- **Role**: Strategic planning and task decomposition
- **Capabilities**: Goal decomposition, task prioritization, resource planning, risk assessment

### 2. Researcher
- **Role**: Information gathering and validation
- **Capabilities**: Data collection, information verification, source validation, pattern recognition

### 3. Executor
- **Role**: Action-oriented task execution
- **Capabilities**: Task execution, API integration, data processing, result generation

### 4. Reviewer
- **Role**: Quality assurance and validation
- **Capabilities**: Quality assessment, requirement validation, error detection, feedback generation

## Step Types

- **Planner**: Initial analysis and planning
- **Researcher**: Information gathering
- **Executor**: Main task execution
- **Reviewer**: Validation and quality checks
- **Condition**: Branching logic (if/else)
- **Loop**: Repetitive tasks
- **API**: External API calls
- **Approval**: Human-in-the-loop checkpoints
- **End**: Workflow completion

## Tool Types

- **api**: External HTTP API calls
- **function**: Custom functions/code
- **condition**: Conditional logic
- **formatter**: Output formatting

## Validation

The API validates generated workflows for:
- Required fields (workflowName, goal, steps, agents, tools)
- Valid step types
- Valid agent types
- Proper dependencies (no circular dependencies, all dependencies exist)
- Proper step references in next/success/failure paths
- Tool usage consistency

## Enrichment

The API enriches workflows by:
- Adding default agent configurations
- Fixing invalid dependencies
- Ensuring all referenced agents and tools exist
- Normalizing step IDs
- Setting default values for missing fields

## React Flow Integration

The `convertWorkflowToReactFlow` utility converts the generated workflow to React Flow nodes and edges format for visualization.

## Example Goals

1. **Simple**: "Send a daily weather report to my email"
2. **Medium**: "Research and summarize the latest AI news about machine learning"
3. **Complex**: "Build an automated system that monitors competitor prices, analyzes trends, and alerts me when there's a significant price change"

## Future Enhancements

- [ ] Add support for custom agent templates
- [ ] Implement workflow optimization suggestions
- [ ] Add cost estimation based on steps and tools
- [ ] Support for workflow version history
- [ ] Integration with existing Agent Builder UI
- [ ] Add pre-built workflow templates
- [ ] Support for multi-turn conversation context
