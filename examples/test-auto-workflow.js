/**
 * Auto Workflow Generator - API Test Script
 * 
 * Run this script to test the /api/auto-workflow endpoint
 * Usage: node --experimental-specifier-resolution=node examples/test-auto-workflow.js
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

async function testEndpoint(description, testFn) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`TEST: ${description}`);
  console.log("=".repeat(60));
  
  try {
    const result = await testFn();
    if (result.success) {
      console.log("✅ PASSED");
      if (result.data) {
        console.log("\nResponse Data:");
        console.log(JSON.stringify(result.data, null, 2));
      }
    } else {
      console.log("❌ FAILED");
      if (result.error) {
        console.log("Error:", result.error);
      }
      if (result.details) {
        console.log("Details:", result.details);
      }
    }
    return result.success;
  } catch (error) {
    console.log("❌ EXCEPTION");
    console.log("Error:", error.message);
    return false;
  }
}

async function testGetDocumentation() {
  const response = await fetch(`${API_BASE_URL}/api/auto-workflow`);
  const data = await response.json();
  
  return {
    success: response.ok && data.endpoint && data.method === "POST",
    data: response.ok ? data : null,
    error: !response.ok ? "Failed to fetch documentation" : null
  };
}

async function testSimpleWorkflow() {
  const response = await fetch(`${API_BASE_URL}/api/auto-workflow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      goal: 'Send a daily weather report'
    })
  });
  
  const data = await response.json();
  
  return {
    success: response.ok && data.success && data.workflow,
    data: response.ok ? data : null,
    error: !response.ok ? data.error : null,
    details: data.details
  };
}

async function testMediumComplexity() {
  const response = await fetch(`${API_BASE_URL}/api/auto-workflow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      goal: 'Research and summarize AI news about machine learning',
      options: {
        context: 'Focus on recent developments',
        complexity: 'medium'
      }
    })
  });
  
  const data = await response.json();
  
  return {
    success: response.ok && data.success && data.workflow,
    data: response.ok ? data : null,
    error: !response.ok ? data.error : null
  };
}

async function testHighComplexity() {
  const response = await fetch(`${API_BASE_URL}/api/auto-workflow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      goal: 'Build an automated system that monitors competitor prices and alerts me',
      options: {
        complexity: 'high',
        maxSteps: 10
      }
    })
  });
  
  const data = await response.json();
  
  return {
    success: response.ok && data.success && data.workflow,
    data: response.ok ? data : null,
    error: !response.ok ? data.error : null
  };
}

async function testMissingGoal() {
  const response = await fetch(`${API_BASE_URL}/api/auto-workflow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  
  const data = await response.json();
  
  return {
    success: !response.ok && !data.success && data.error,
    error: data.error
  };
}

async function testEmptyGoal() {
  const response = await fetch(`${API_BASE_URL}/api/auto-workflow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      goal: ''
    })
  });
  
  const data = await response.json();
  
  return {
    success: !response.ok && !data.success,
    error: data.error
  };
}

async function testValidation() {
  const response = await fetch(`${API_BASE_URL}/api/auto-workflow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      goal: 'Test workflow validation'
    })
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    return {
      success: false,
      error: data.error || "Request failed"
    };
  }
  
  const hasValidation = data.metadata && data.metadata.validation;
  const isValid = data.metadata?.validation?.isValid;
  
  return {
    success: hasValidation && typeof isValid === 'boolean',
    data: {
      isValid,
      errors: data.metadata?.validation?.errors,
      warnings: data.metadata?.validation?.warnings
    }
  };
}

async function testWorkflowStructure() {
  const response = await fetch(`${API_BASE_URL}/api/auto-workflow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      goal: 'Create a simple task automation workflow'
    })
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    return {
      success: false,
      error: data.error
    };
  }
  
  const workflow = data.workflow;
  
  const checks = [
    { name: 'Has workflowName', pass: !!workflow.workflowName },
    { name: 'Has description', pass: typeof workflow.description === 'string' },
    { name: 'Has goal', pass: !!workflow.goal },
    { name: 'Has steps array', pass: Array.isArray(workflow.steps) },
    { name: 'Has agents array', pass: Array.isArray(workflow.agents) },
    { name: 'Has tools array', pass: Array.isArray(workflow.tools) },
    { name: 'Has dependencies', pass: typeof workflow.dependencies === 'object' },
    { name: 'Has estimatedComplexity', pass: ['low', 'medium', 'high'].includes(workflow.estimatedComplexity) },
    { name: 'Has estimatedSteps', pass: typeof workflow.estimatedSteps === 'number' },
    { name: 'Steps have required fields', pass: workflow.steps.every(s => s.id && s.name && s.type) },
    { name: 'Agents have required fields', pass: workflow.agents.every(a => a.id && a.name) }
  ];
  
  console.log("\nStructure Checks:");
  checks.forEach(check => {
    console.log(`  ${check.pass ? '✅' : '❌'} ${check.name}`);
  });
  
  const allPassed = checks.every(c => c.pass);
  
  return {
    success: allPassed,
    data: {
      checks,
      workflowSummary: {
        steps: workflow.steps.length,
        agents: workflow.agents.length,
        tools: workflow.tools.length,
        complexity: workflow.estimatedComplexity
      }
    }
  };
}

async function runAllTests() {
  console.log("\n🚀 Starting Auto Workflow Generator API Tests");
  console.log(`📡 API Base URL: ${API_BASE_URL}`);
  console.log(`⏰ Test Time: ${new Date().toISOString()}`);
  
  const tests = [
    { name: "GET API Documentation", fn: testGetDocumentation },
    { name: "POST Simple Workflow", fn: testSimpleWorkflow },
    { name: "POST Medium Complexity", fn: testMediumComplexity },
    { name: "POST High Complexity", fn: testHighComplexity },
    { name: "POST Missing Goal (should fail)", fn: testMissingGoal },
    { name: "POST Empty Goal (should fail)", fn: testEmptyGoal },
    { name: "Test Validation Response", fn: testValidation },
    { name: "Test Workflow Structure", fn: testWorkflowStructure },
  ];
  
  const results = [];
  
  for (const test of tests) {
    const passed = await testEndpoint(test.name, test.fn);
    results.push({ name: test.name, passed });
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(60));
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`\nTotal Tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`\nSuccess Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log("\n❌ Failed Tests:");
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}`);
    });
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("🏁 Testing Complete");
  console.log("=".repeat(60) + "\n");
  
  return failed === 0;
}

if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error("❌ Test runner failed:", error);
      process.exit(1);
    });
}

module.exports = { runAllTests };
