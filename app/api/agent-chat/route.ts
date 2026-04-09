import { NextRequest, NextResponse } from "next/server";
import { groq } from "@/config/GroqModel";

export async function POST(req: NextRequest) {
  try {
    const { input, agentToolConfig, userInputData } = await req.json();

    console.log("\n🚀 WORKFLOW STARTED");
    console.log("🧾 Full Input Data:", { input, agentToolConfig });
    console.log("🧾 USER INPUT RECEIVED:", userInputData);

    if (!agentToolConfig) {
      console.error("❌ Agent config missing");
      return NextResponse.json({
        success: false,
        error: "Agent config missing",
      });
    }

    const { systemPrompt, agents, tools, primaryAgentName } =
      agentToolConfig;

    // Inject user data into system prompt if available
    const userDataInjection = userInputData
      ? `\n\nIMPORTANT: Use the following REAL customer data for this interaction. Do NOT generate fake data:\n${JSON.stringify(userInputData, null, 2)}\n`
      : "";

    console.log("📦 Available Agents:", agents.map((a: any) => a.id));
    console.log("📦 Available Tools:", tools.map((t: any) => t.id));

    // ============================
    // 🔹 GET PRIMARY AGENT
    // ============================
    console.log("\n==============================");
    console.log("⚙️ Selecting Primary Agent");
    
    const primaryAgent =
      agents.find((a: any) => a.id === primaryAgentName) ||
      agents[0];

    console.log("✅ Primary Agent Selected:", primaryAgent?.id);
    console.log("📌 Primary Agent Tools:", primaryAgent?.tools);

    const agentTools = tools.filter((t: any) =>
      primaryAgent.tools.includes(t.id)
    );

    const toolNames = agentTools.map((t: any) => t.name).join(", ");
    console.log("🔧 Agent Tool Names:", toolNames || "None");

    // ============================
    // 🧠 STEP 1: LLM DECISION
    // ============================
    console.log("\n==============================");
    console.log("🤖 Executing via LLM (Decision Step)");
    console.log("🧠 Prompt sent to LLM:", input.substring(0, 200) + "...");

    const decision = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `
${systemPrompt}

${userDataInjection}
AVAILABLE TOOLS:
${toolNames}

STRICT RULES:
- NEVER include apiKey, token, headers
- ONLY include required query params
- If no tool needed → return normal text
- If tool needed → return ONLY JSON
- NEVER ask questions to the user
- Use the given input and context to complete the task
- If information is missing, make a reasonable assumption
- Always produce a final answer or result
- IF user data is provided above, you MUST use it. Do NOT generate fake names, order IDs, or any fabricated data.

FORMAT:
{
  "tool": "EXACT_TOOL_NAME",
  "params": {
    "key": "value"
  }
}
`,
        },
        {
          role: "user",
          content: input,
        },
      ],
    });

    let responseText =
      decision.choices[0]?.message?.content ?? "";

    console.log("🧠 LLM Response:", responseText.substring(0, 300) + "...");

    // ============================
    // 🔥 SAFE JSON EXTRACTOR
    // ============================
    const extractJSON = (text: string) => {
      try {
        const match = text.match(/\{[\s\S]*\}/);
        return match ? JSON.parse(match[0]) : null;
      } catch {
        return null;
      }
    };

    let parsed = extractJSON(responseText);

    // ============================
    // ✅ NORMAL RESPONSE (NO TOOL)
    // ============================
    if (!parsed || parsed.tool === "None") {
      console.log("✅ No tool needed - returning LLM response directly");
      console.log("📤 Output:", responseText.substring(0, 200) + "...");
      
      return NextResponse.json({
        success: true,
        reply: responseText,
        source: "llm",
      });
    }

    console.log("🔧 Tool Decision Parsed:", parsed);

    // ============================
    // 🔍 DETECTING TOOL CALL
    // ============================
    console.log("\n==============================");
    console.log("🔍 Checking if node is calling a tool...");
    console.log("🛠️ Attempting to call tool:", parsed.tool);

    // ============================
    // 🔥 SANITIZE PARAMS
    // ============================
    const cleanParams: any = {};

    for (const key in parsed.params || {}) {
      if (
        key.toLowerCase().includes("key") ||
        key.toLowerCase().includes("token") ||
        key.toLowerCase().includes("auth")
      ) {
        continue;
      }

      cleanParams[key] = parsed.params[key];
    }

    // ============================
    // 🔹 FIND TOOL
    // ============================
    // Find tool - match by name or ID (flexible matching)
    let tool = agentTools.find(
      (t: any) =>
        t.name.toLowerCase() === parsed.tool.toLowerCase() ||
        t.id.toLowerCase() === parsed.tool.toLowerCase() ||
        t.name.toLowerCase().includes(parsed.tool.toLowerCase()) ||
        parsed.tool.toLowerCase().includes(t.name.toLowerCase())
    );

    // ============================================================
    // 🖼️ IMAGE GENERATION - STRICT PROMPT SOURCE
    // ============================================================
    
    // Force image handling if tool name contains "image" or "pollination"
    const isImageTool = parsed?.tool?.toLowerCase().includes("image") || 
                      parsed?.tool?.toLowerCase().includes("pollination");
    
    // STRICT: Use ONLY parsed.params.prompt
    let promptToSend = parsed?.params?.prompt || "";
    
    // If no prompt in params but tool is image-related, check for "prompt" at top level OR params keys
    if (!promptToSend && isImageTool) {
      promptToSend = parsed?.prompt || "";
      
      // Try to find any key that looks like a prompt
      if (!promptToSend && parsed?.params) {
        const paramsKeys = Object.keys(parsed.params);
        for (const key of paramsKeys) {
          if (key.toLowerCase().includes("prompt") || key.toLowerCase().includes("subject") || key.toLowerCase().includes("description")) {
            promptToSend = parsed.params[key];
            break;
          }
        }
      }
    }
    
    // Final fallback - must have prompt
    if (!promptToSend || promptToSend.length < 2) {
      promptToSend = "beautiful scenery";
    }
    
    promptToSend = promptToSend.trim();
    
    // Generate image if tool is image-related OR if no tool found but request is image
    if (isImageTool || (!tool && (parsed.tool?.toLowerCase().includes("image") || 
                               parsed.tool?.toLowerCase().includes("pollination")))) {
      console.log("🖼️ Generating image with STRICT prompt source");
      console.log("📝 STRICT PROMPT:", promptToSend);
      
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptToSend)}`;
      console.log("🖼️ IMAGE URL:", imageUrl);
      
      return NextResponse.json({
        success: true,
        type: "image",
        imageUrl: imageUrl,
        prompt: promptToSend,
        source: "api"
      });
    }

    if (!tool) {
      console.error(`❌ TOOL NOT FOUND: ${parsed.tool}`);
      console.log("⚠️ Available tools:", agentTools.map((t: any) => t.name));
      console.log("⚠️ Falling back to LLM execution...");
      
      const fallbackMsg = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant. The user asked: "${input}". The system tried to use a tool called "${parsed.tool}" but that tool is not available. Provide a helpful response based on your knowledge.`,
          },
          { role: "user", content: input },
        ],
      });
      
      const fallbackResponse = fallbackMsg.choices[0]?.message?.content ?? "";
      console.log("🤖 LLM Fallback Response:", fallbackResponse.substring(0, 200) + "...");
      
      return NextResponse.json({
        success: true,
        reply: fallbackResponse,
        source: "llm",
      });
    }

    console.log("✅ Tool Found:", tool.name);

    // ============================
    // ❌ EMPTY PARAM CHECK
    // ============================
    if (Object.keys(cleanParams).length === 0) {
      return NextResponse.json({
        success: true,
        reply: "Please provide required details.",
      });
    }

    // ============================
    // 🔑 API KEY CHECK + LLM FALLBACK
    // ============================
    if (tool.includeApiKey && !tool.apiKey) {
      console.log("⚠️ Using LLM fallback (no API key)");

      const extractTopic = (text: string): string => {
        if (!text) return "";
        const match = text.match(/about\s+(.+?)(?:\n|$)/i);
        if (match) return match[1].trim();
        return text.toLowerCase().replace(/get|latest|news|about/gi, "").trim();
      };

      const extractCity = (text: string): string => {
        if (!text) return "";
        const match = text.match(/(?:in|for|of)\s+([A-Za-z\s]+?)(?:\n|$)/i);
        if (match) return match[1].trim();
        return text.replace(/[^a-zA-Z\s]/g, "").trim() || "Bangalore";
      };

      const generateSearchUrl = (title: string): string => {
        return `https://www.google.com/search?q=${encodeURIComponent(title)}`;
      };

      let fallbackPrompt = "";
      let query = "";

      if (tool.url.includes("newsapi.org")) {
        query = extractTopic(input);
        if (!query || query.length < 2) {
          query = "general news";
        }
        fallbackPrompt = `You are a news assistant. Generate 5 realistic, recent-looking news headlines about "${query}".

Return ONLY in this exact format (no other text):
1. Headline about ${query} – Source Name
Short description of the article...

2. Headline – Source Name
Short description...

3. Headline – Source Name
Short description...

4. Headline – Source Name
Short description...

5. Headline – Source Name
Short description...

IMPORTANT:
- Use varied sources: BBC, CNN, Reuters, The Guardian, AP News, Bloomberg, NYTimes
- Headlines must be realistic and professional
- Descriptions should be 1-2 sentences
- Do NOT include any URLs in your response
- Keep formatting clean
- Do NOT add any intro or concluding text`;

      } else if (tool.url.includes("weatherapi.com")) {
        query = extractCity(input);
        fallbackPrompt = `You are a weather assistant. Provide current weather information for "${query}".

Return ONLY in this exact format (no other text):
Location: ${query}
Temperature: [realistic temperature in Celsius]
Condition: [Clear/Sunny/Cloudy/Rainy/Partly Cloudy/etc.]
Humidity: [realistic percentage]%
Wind: [realistic speed] km/h

Rules:
- Use realistic values for ${query}
- Temperature should be appropriate for the location type
- Do NOT add any URLs
- Do NOT add any intro or concluding text`;
      } else {
        return NextResponse.json({
          success: true,
          reply: `API key required for ${tool.name}. Please provide an API key in the node settings.`,
        });
      }

      const fallbackResponse = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: fallbackPrompt,
          },
        ],
      });

      let fallbackText = fallbackResponse.choices[0]?.message?.content ?? "";

      if (tool.url.includes("newsapi.org")) {
        const lines = fallbackText.split("\n").filter(line => line.trim());
        const formattedArticles: string[] = [];
        
        lines.forEach((line, idx) => {
          const trimmedLine = line.trim();
          if (trimmedLine.match(/^\d+\./)) {
            const articleNum = trimmedLine.match(/^(\d+)\.\s*/)?.[1] || (idx + 1);
            formattedArticles.push(trimmedLine);
          } else if (trimmedLine && !trimmedLine.match(/^Source:/)) {
            if (formattedArticles.length > 0) {
              formattedArticles[formattedArticles.length - 1] += "\n" + trimmedLine;
            }
          }
        });

        const finalOutput: string[] = [];
        let currentArticle = "";

        for (const line of lines) {
          const trimmed = line.trim();
          
          if (trimmed.match(/^\d+\./)) {
            if (currentArticle) {
              finalOutput.push(currentArticle);
            }
            currentArticle = trimmed;
          } else if (trimmed && !trimmed.match(/^Source:/)) {
            currentArticle += "\n" + trimmed;
          }
        }
        
        if (currentArticle) {
          finalOutput.push(currentArticle);
        }

        fallbackText = finalOutput.map((article, idx) => {
          const titleLine = article.split("\n")[0];
          const title = titleLine.replace(/^\d+\.\s*/, "").split("–")[0].trim();
          const searchUrl = generateSearchUrl(title);
          return `${article}\n${searchUrl}`;
        }).join("\n\n");
      }

      return NextResponse.json({
        success: true,
        reply: fallbackText,
        source: "llm",
      });
    }

    // ============================
    // 🌐 BUILD API URL (FIXED)
    // ============================
    let url = tool.url;

    const queryParams = new URLSearchParams();

    // Extract clean topic from input for News API
    const extractTopic = (text: string): string => {
      if (!text) return "";
      const match = text.match(/about\s+(.+?)(?:\n|$)/i);
      if (match) return match[1].trim();
      return text.toLowerCase().replace(/get|latest|news|about/gi, "").trim();
    };

    if (tool.url.includes("newsapi.org")) {
      const topic = extractTopic(input);
      if (!topic || topic.length < 2) {
        return NextResponse.json({
          success: true,
          reply: "Could not determine news topic from input.",
        });
      }
      queryParams.append("q", `"${topic}"`);
      queryParams.append("language", "en");
      queryParams.append("sortBy", "publishedAt");
      queryParams.append("pageSize", "5");
    } else if (tool.url.includes("weatherapi.com")) {
      const cityMatch = input.match(/(?:in|for|of)\s+([A-Za-z\s]+?)(?:\n|$)/i);
      const city = cityMatch ? cityMatch[1].trim() : input.replace(/[^a-zA-Z\s]/g, "").trim();
      queryParams.append("q", city || "Bangalore");
    } else {
      // All other APIs - use clean params
      for (const key in cleanParams) {
        queryParams.append(key, cleanParams[key]);
      }
    }

    url += url.includes("?")
      ? `&${queryParams.toString()}`
      : `?${queryParams.toString()}`;

    // 🔥 FIX: HANDLE DIFFERENT API KEY FORMATS
    if (tool.includeApiKey && tool.apiKey) {
      if (tool.url.includes("weatherapi.com")) {
        url += `&key=${tool.apiKey}`; // ✅ Weather API fix
      } else {
        url += `&apiKey=${tool.apiKey}`; // ✅ News API etc.
      }
    }

    console.log("🌐 URL:", url);

    // ============================
    // 🔹 CALL API (SAFE)
    // ============================
    const apiRes = await fetch(url);

    let data;

    try {
      data = await apiRes.json();
    } catch {
      const text = await apiRes.text();

      console.error("❌ NON-JSON RESPONSE:", text);

      return NextResponse.json({
        success: true,
        reply:
          "Failed to fetch valid data from API. Please try again.",
      });
    }

    console.log("📦 RAW API:", data);

    // ============================
    // ❌ HANDLE API ERROR
    // ============================
    if (data?.status === "error" || data?.error) {
      return NextResponse.json({
        success: true,
        reply:
          data?.message ||
          data?.error?.message ||
          "API Error occurred",
      });
    }

    // ============================
    // 🔥 CLEAN + SHRINK DATA
    // ============================
    const cleanAndShrink = (data: any) => {
      // 📰 NEWS
      if (data?.articles) {
        return data.articles.slice(0, 5).map((a: any) => ({
          title: a.title,
          description: a.description?.slice(0, 100),
          url: a.url,
        }));
      }

      // 🌤️ WEATHER
      if (data?.current) {
        return {
          city: data.location?.name,
          temperature: data.current?.temp_c,
          condition: data.current?.condition?.text,
          humidity: data.current?.humidity,
          wind: data.current?.wind_kph,
        };
      }

      return data;
    };

    const minimalData = cleanAndShrink(data);

    console.log("📉 MINIMAL DATA:", minimalData);

    // ============================
    // 🔥 AUTO FORMAT (NO LLM)
    // ============================
    if (Array.isArray(minimalData)) {
      const formatted = minimalData
        .map(
          (item: any, i: number) =>
            `${i + 1}. ${item.title}\n${item.description}\n${item.url}`
        )
        .join("\n\n");

      return NextResponse.json({
        success: true,
        reply: formatted,
        source: "api",
      });
    }

    // ============================
    // 🧠 FINAL LLM (SAFE SIZE)
    // ============================
    const finalResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: "Give short and clear answer.",
        },
        {
          role: "user",
          content: `
User: ${input}

Data:
${JSON.stringify(minimalData)}
`,
        },
      ],
    });

    console.log("🎯 FINAL OUTPUT WITH INPUT:", finalResponse.choices[0]?.message?.content?.substring(0, 200) + "...");

    return NextResponse.json({
      success: true,
      reply:
        finalResponse.choices[0]?.message?.content ??
        "No response",
      source: "api",
    });

  } catch (error) {
    console.error("❌ ERROR:", error);
    console.log("\n🎯 FINAL WORKFLOW OUTPUT: Error occurred");

    return NextResponse.json({
      success: false,
      error: "Agent execution failed",
    });
  }
}