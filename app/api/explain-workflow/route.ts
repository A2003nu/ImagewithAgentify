import { NextRequest, NextResponse } from "next/server";
import { groq } from "@/config/GroqModel";

export async function POST(req: NextRequest) {
  try {
    const { nodes, edges } = await req.json();

    if (!nodes || nodes.length === 0) {
      return NextResponse.json(
        { error: "No workflow to explain" },
        { status: 400 }
      );
    }

    const nodesInfo = nodes
      .map((n: any) => `${n.id}: ${n.data?.label || n.type || "Node"}`)
      .join("\n");

    const edgesInfo =
      edges && edges.length > 0
        ? edges.map((e: any) => `${e.source} → ${e.target}`).join("\n")
        : "No connections";

    const prompt = `You are an AI system that explains workflows in simple terms.

Given this workflow:

Nodes:
${nodesInfo}

Connections:
${edgesInfo}

Explain this workflow step-by-step in simple terms for a non-technical user.
Each step should explain what that node does and why it's important.

Return ONLY a JSON array in this exact format (no other text):
[
  { "step": 1, "title": "Step Title", "description": "What this step does" }
]`;

    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || "[]";
    const parsed = JSON.parse(content);

    return NextResponse.json({ explanation: parsed });
  } catch (error) {
    console.error("Error generating explanation:", error);
    return NextResponse.json(
      { error: "Failed to generate explanation" },
      { status: 500 }
    );
  }
}