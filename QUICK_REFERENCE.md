# Quick Reference - Auto Workflow Generator

## 🚀 Quick Start

### 1. Generate a Workflow

```typescript
const response = await fetch('/api/auto-workflow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    goal: 'Your goal here',
    options: {
      complexity: 'medium', // low | medium | high | auto
      context: 'Additional context',
      maxSteps: 10
    }
  })
});

const { workflow, success } = await response.json();
```

### 2. Validate a Workflow

```typescript
import { validateWorkflow } from '@/lib/workflow';

const result = validateWorkflow(myWorkflow);
if (result.isValid) {
  console.log('Valid!');
} else {
  console.log('Errors:', result.errors);
  console.log('Warnings:', result.warnings);
}
```

### 3. Convert to React Flow

```typescript
import { convertWorkflowToReactFlow } from '@/lib/workflow';

const { nodes, edges } = convertWorkflowToReactFlow(workflow);
```

## 📦 Import All Utilities

```typescript
import * as Workflow from '@/lib/workflow';
// or
import { validateWorkflow, enrichWorkflow } from '@/lib/workflow';
```

## 🔧 Common Operations

### Create a Workflow
```typescript
import { createEmptyWorkflow } from '@/lib/workflow';

const workflow = createEmptyWorkflow('My Goal');
```

### Add a Step
```typescript
import { createStep, addStepToWorkflow } from '@/lib/workflow';

const step = createStep('Analyze', 'Researcher', 'Research the topic');
const updatedWorkflow = addStepToWorkflow(workflow, step);
```

### Manage Dependencies
```typescript
import { addDependency } from '@/lib/workflow';

const updated = addDependency(workflow, 'step-2', 'step-1');
```

### Export/Import
```typescript
import { exportWorkflowToJSON, importWorkflowFromJSON } from '@/lib/workflow';

// Export
const json = exportWorkflowToJSON(workflow);

// Import
const imported = importWorkflowFromJSON(json);
```

### Calculate Metrics
```typescript
import { calculateWorkflowMetrics } from '@/lib/workflow';

const metrics = calculateWorkflowMetrics(workflow);
console.log(metrics.totalSteps, metrics.estimatedComplexity);
```

## 📊 Workflow Structure

```typescript
{
  workflowName: string,
  description: string,
  goal: string,
  steps: Step[],        // Array of workflow steps
  agents: Agent[],      // Array of agents
  tools: Tool[],        // Array of tools
  dependencies: {},     // Step dependencies
  estimatedComplexity: 'low' | 'medium' | 'high',
  estimatedSteps: number
}
```

## 👤 Agent Types

- **Planner**: Strategic planning
- **Researcher**: Information gathering
- **Executor**: Task execution
- **Reviewer**: Quality assurance

## 📝 Step Types

- **Planner**: Initial planning
- **Researcher**: Data gathering
- **Executor**: Main tasks
- **Reviewer**: Validation
- **Condition**: If/else branching
- **Loop**: Repetition
- **API**: External calls
- **Approval**: Human checkpoint
- **End**: Completion

## 🔧 Tool Types

- **api**: HTTP API calls
- **function**: Custom code
- **condition**: Logic
- **formatter**: Output formatting

## ✅ Validation Rules

The system validates:
- ✅ Required fields present
- ✅ Valid step IDs (no duplicates)
- ✅ Valid agent/tool references
- ✅ Proper dependencies
- ✅ No circular dependencies
- ✅ Valid next/failure paths

## 🚨 Error Handling

```typescript
if (!response.ok) {
  const error = await response.json();
  console.log('Error:', error.error);
  console.log('Details:', error.details);
}
```

## 📄 API Response

### Success
```typescript
{
  success: true,
  workflow: { ... },
  metadata: {
    generatedAt: "2026-03-24T10:00:00.000Z",
    model: "llama-3.3-70b-versatile",
    validation: { isValid: true, errors: [], warnings: [] }
  }
}
```

### Error
```typescript
{
  success: false,
  error: "Error message",
  details: "Additional details",
  warnings: ["Warning 1"]
}
```

## 🧪 Testing

```bash
# Start dev server
npm run dev

# Run tests
node examples/test-auto-workflow.js
```

## 📖 Documentation

- **API Docs**: `/docs/AUTO_WORKFLOW_API.md`
- **Module README**: `/lib/workflow/README.md`
- **Implementation**: `/IMPLEMENTATION_SUMMARY.md`
- **Examples**: `/examples/auto-workflow-example.ts`

## 🎯 Best Practices

1. **Start Simple**: Use low complexity for testing
2. **Provide Context**: Add context for better results
3. **Check Validation**: Always check validation.warnings
4. **Review Structure**: Verify workflow structure before using
5. **Iterate**: Refine based on results

## 🔄 Workflow to React Flow

```typescript
import { convertWorkflowToReactFlow } from '@/lib/workflow';

const { nodes, edges } = convertWorkflowToReactFlow(workflow);

// Use with React Flow
<ReactFlow
  nodes={nodes}
  edges={edges}
  nodeTypes={nodeTypes}
/>
```

## 💡 Tips

- Use specific, clear goals for better results
- Add context to guide the LLM
- Review generated workflows before use
- Use validation warnings to improve quality
- Check metrics to understand complexity
- Start with low complexity, increase as needed

## 📞 Support

For issues or questions:
1. Check `/lib/workflow/README.md`
2. Review `/docs/AUTO_WORKFLOW_API.md`
3. Run test suite: `node examples/test-auto-workflow.js`
4. Check implementation: `/IMPLEMENTATION_SUMMARY.md`
