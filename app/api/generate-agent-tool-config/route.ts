import { NextRequest, NextResponse } from "next/server";
import { groq } from "@/config/GroqModel";

const PROMPT = `
from this flow, Generate a agent instruction prompt with all setting info in JSON format. 
Do not add any extra text just return JSON only.

The agent MUST use the provided customer data in EVERY step. Do NOT generate random/fake data.

{
  "systemPrompt": "",
  "primaryAgentName": "",
  "agents": [
    {
      "id": "agent-id",
      "instruction": "",
      "tools": ["tool-id"],
      "output": ""
    }
  ],
  "tools": [
    {
      "id": "id",
      "name": "",
      "description": "",
      "method": "GET",
      "url": "",
      "includeApiKey": true,
      "apiKey": "",
      "parameters": {
        "key": "value"
      }
    }
  ]
}

`;

export async function POST(req: NextRequest) {
  try {
    const { jsonConfig, userInputData } = await req.json();

    console.log("\n==============================");
    console.log("⚙️ Generating Agent Tool Config");
    console.log("📥 Input Workflow Config:", {
      workflowName: jsonConfig.workflowName,
      steps: jsonConfig.steps?.length,
      agents: jsonConfig.agents?.length,
      tools: jsonConfig.tools?.length
    });
    
    console.log("🧾 USER INPUT RECEIVED:", userInputData);

    const userDataContext = userInputData 
      ? `\n\nIMPORTANT CUSTOMER DATA (USE THIS IN EVERY STEP):\n${JSON.stringify(userInputData, null, 2)}\n\nYou MUST use this exact data. Do NOT generate fake names or order IDs.`
      : "";

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: JSON.stringify(jsonConfig) + userDataContext + PROMPT,
        },
      ],
    });

   const outputText = completion.choices[0].message.content ?? "";

   console.log("🧠 LLM Response (raw):", outputText.substring(0, 300) + "...");

   let parsedJson;

try {
  parsedJson = JSON.parse(
    outputText.replace("```json", "").replace("```", "")
  );
  console.log("✅ Parsed Tool Config:", {
    systemPrompt: parsedJson.systemPrompt?.substring(0, 100) + "...",
    agents: parsedJson.agents?.length,
    tools: parsedJson.tools?.length
  });
} catch (err) {
  console.error("❌ Failed to parse JSON from LLM response");
  return NextResponse.json({
    error: "Failed to parse JSON from LLM response",
    raw: outputText,
  });
}

    return NextResponse.json(parsedJson);

  } catch (error) {
    console.error(error);

    return NextResponse.json({
      error: "Failed to generate agent config",
    });
  }
}