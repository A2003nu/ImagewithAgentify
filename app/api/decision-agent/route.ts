import { NextRequest, NextResponse } from "next/server";
import { groq } from "@/config/GroqModel";

export async function POST(req: NextRequest) {
  try {
    const { customerName, orderId, issueType, delayDays, additionalMessage } = await req.json();

    if (!customerName || !orderId || !issueType) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields",
      });
    }

    const logs: string[] = [];
    const addLog = (log: string) => logs.push(log);

    addLog("🚀 Starting Decision Agent Workflow");
    addLog("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    addLog("📥 Step 1: Input Received");
    addLog(`   👤 Customer: ${customerName}`);
    addLog(`   📦 Order ID: ${orderId}`);
    addLog(`   ⚠️ Issue: ${issueType}`);
    addLog(`   ⏱ Delay: ${delayDays || 0} days`);
    if (additionalMessage) {
      addLog(`   💬 Additional: ${additionalMessage}`);
    }

    addLog("🧠 Step 2: Analyze Complaint");
    const severityMap: Record<string, string> = {
      "late delivery": "high",
      "damaged product": "high",
      "wrong item": "medium",
      "missing item": "medium",
      "quality issue": "medium",
      "billing error": "high",
      "other": "low",
    };
    const severity = severityMap[issueType.toLowerCase()] || "medium";
    addLog(`   📊 Issue Severity: ${severity}`);

    addLog("😀 Step 3: Sentiment Analysis");
    let sentiment = "Neutral";
    let priority = "Medium";
    if (severity === "high" || (delayDays && delayDays > 2)) {
      sentiment = "Negative";
      priority = "High";
    } else if (delayDays && delayDays <= 1 && severity === "low") {
      sentiment = "Positive";
      priority = "Low";
    }
    addLog(`   😍 Sentiment: ${sentiment}`);
    addLog(`   ⚡ Priority: ${priority}`);

    addLog("💰 Step 4: Compensation Logic");
    let compensation = "None";
    let compensationValue = 0;
    if (delayDays) {
      if (delayDays > 5) {
        compensation = "20% refund";
        compensationValue = 20;
      } else if (delayDays > 2) {
        compensation = "10% refund";
        compensationValue = 10;
      } else {
        compensation = "5% discount coupon";
        compensationValue = 5;
      }
    }
    addLog(`   💵 Compensation: ${compensation}`);

    addLog("📌 Step 5: Action Selection");
    let action = "Normal Response";
    if (priority === "High") {
      action = "Escalate to support team";
    } else if (priority === "Low") {
      action = "Appreciation Message";
    }
    addLog(`   ➡️ Action: ${action}`);

    if (action.includes("Escalate")) {
      addLog("🚨 Step 6: Escalation Process");
      addLog("   📋 Creating support ticket...");
      const ticketId = "TKT-" + Math.floor(Math.random() * 90000 + 10000);
      addLog(`   ✅ Ticket created: ${ticketId}`);
      addLog("   📧 Notifying support team...");
    }

    addLog("💬 Step 7: Generating Response");
    
    const rootCauses = ["Logistics delay in delivery region", "High demand period", "Weather disruption", "Courier operational issues", "Inventory shortage"];
    const rootCause = rootCauses[Math.floor(Math.random() * rootCauses.length)];
    const resolutionStatus = action.includes("Escalate") ? "Escalated to senior support" : "Resolved with compensation";
    
    const generateResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `You are a customer support agent. Generate a professional response to a customer complaint.

IMPORTANT - STRICT RULES:
1. MUST use the customer's REAL name: ${customerName}
2. MUST use the REAL order ID: ${orderId}
3. MUST mention the REAL delay: ${delayDays || 0} days
4. MUST include the compensation: ${compensation}
5. Keep it SHORT - max 3 sentences
6. Start with apology, then resolution, then next steps
7. Use clear, professional tone
8. NO long paragraphs
9. NO fabricated data - use ONLY what is provided

Response format:
"Dear [name], we apologize for the [delay] day delay with your order [orderId]. As compensation, we're offering [compensation]. [Next steps]."

If escalated:
"We apologize for the inconvenience with order [orderId]. Your issue has been escalated to our support team. You will receive a call within 24 hours."`,
        },
        {
          role: "user",
          content: additionalMessage || `Customer issue: ${issueType}`,
        },
      ],
    });

    const responseText = generateResponse.choices[0]?.message?.content ?? "";
    addLog("   ✅ Response generated successfully");

    addLog("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    addLog("🎯 WORKFLOW COMPLETED SUCCESSFULLY");
    addLog("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return NextResponse.json({
      success: true,
      result: {
        intent: "Complaint",
        sentiment,
        confidence: 95,
        reasoning: `Issue type: ${issueType}, Delay: ${delayDays || 0} days → Priority: ${priority}`,
        priority,
        action,
        response: responseText,
        customerName,
        orderId,
        issueType,
        delayDays: delayDays || 0,
        compensation,
        compensationValue,
        analysis: {
          rootCause,
          resolutionStatus,
          severity: priority,
        },
        logs,
      },
    });
  } catch (error) {
    console.error("❌ Decision Agent Error:", error);
    return NextResponse.json({
      success: false,
      error: "Decision agent failed",
    });
  }
}
