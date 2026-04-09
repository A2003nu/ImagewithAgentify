# Quick Reference: Modified Code

## File: `app/agent-builder/[agentId]/page.tsx`

## CHANGE 1: Handler Function (Lines 204-247)

```typescript
const handleGenerateWorkflow = async () => {
  // 1. Ask user for input with prompt()
  const userGoal = prompt("Enter your workflow goal (e.g., 'Get weather and news of Bangalore'):");

  // 2. Validate input
  if (!userGoal || userGoal.trim() === "") {
    toast.error("Please enter a goal to generate workflow");
    return;
  }

  // 3. Show loading state
  const loadingToastId = toast.loading("Generating workflow...");

  try {
    // 4. Call API
    const res = await fetch("/api/auto-workflow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        goal: userGoal.trim(),
      }),
    });

    // 5. Parse response
    const data = await res.json();

    if (!data.success || !data.workflow) {
      toast.error(data.error || "Failed to generate workflow", { id: loadingToastId });
      return;
    }

    // 6. Convert workflow
    const { nodes: newNodes, edges: newEdges } = convertWorkflowToFlow(data.workflow);

    // 7. Update React Flow
    setAddedNodes([]);
    setNodeEdges([]);

    setTimeout(() => {
      setAddedNodes(newNodes);
      setNodeEdges(newEdges);
      toast.success("Workflow generated successfully!", { id: loadingToastId });
    }, 0);

  } catch (err) {
    // 8. Handle errors
    console.error("❌ ERROR:", err);
    toast.error("Failed to generate workflow. Please try again.", { id: loadingToastId });
  }
};
```

## CHANGE 2: Button (Lines 278-280)

**Find this:**
```typescript
<Button onClick={testAutoWorkflow} variant="secondary">
  Test Workflow
</Button>
```

**Replace with:**
```typescript
<Button onClick={handleGenerateWorkflow} variant="secondary">
  ⚡ Generate Workflow
</Button>
```

## COMPLETE BUTTON SECTION (Lines 276-290)

```jsx
<div className="flex gap-2">
  <SettingPanel />
  <Button onClick={handleGenerateWorkflow} variant="secondary">
    ⚡ Generate Workflow
  </Button>

  <Button
    variant="destructive"
    onClick={handleDeleteAgent}
  >
    Delete
  </Button>
</div>
```

## HOW IT WORKS

1. User clicks "⚡ Generate Workflow" button
2. Browser prompt appears asking for workflow goal
3. User enters goal (e.g., "Get weather and news of Bangalore")
4. Loading toast appears
5. API call to /api/auto-workflow
6. Workflow generated and converted
7. Canvas updates with new nodes and edges
8. Success toast confirms completion

## USAGE

Simply click the button and enter any workflow goal!

Examples:
- "Get weather and news of Bangalore"
- "Research AI news"
- "Monitor stock prices"
- "Automate email responses"

## NO OTHER CHANGES NEEDED

✅ Import already present: `import { convertWorkflowToFlow } from "@/lib/workflow";` (Line 3)
✅ All state management already exists
✅ No existing logic modified
✅ No new dependencies added
