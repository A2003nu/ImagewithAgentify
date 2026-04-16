export type StepType =
  | "Planner"
  | "Researcher"
  | "Executor"
  | "Reviewer"
  | "Condition"
  | "Loop"
  | "API"
  | "Approval"
  | "End"
  | "Analyzer"
  | "ContentGenerator"
  | "Optimizer"
  | "Personalizer"
  | "Predictor"
  | "Action"
  | "SpamAnalyzer"
  | "PDFParser"
  | "ResumeParser"
  | "RoleMatcher"
  | "Scorer"
  | "QuestionGenerator"
  | "DecisionMaker"
  | "SymptomExtractor"
  | "PatternAnalyzer"
  | "RiskFlagger"
  | "RecommendationProvider"
  | "GoalAnalyzer"
  | "StudyPlanGenerator"
  | "PlanOptimizer"
  | "ConceptRecommender"
  | "ErrorAnalyzer"
  | "RootCauseAnalyzer"
  | "FixGenerator";

export type AgentType = 
  | "Planner" 
  | "Researcher" 
  | "Executor" 
  | "Reviewer"
  | "Audience Analyzer"
  | "Content Generator"
  | "Subject Optimizer"
  | "Email Personalizer"
  | "Engagement Predictor"
  | "Email Sender"
  | "Spam Score Analyzer"
  | "Resume Extractor"
  | "Resume Parser"
  | "Candidate Analyzer"
  | "Role Matcher"
  | "Candidate Scorer"
  | "SWOT Analyzer"
  | "Interview Question Generator"
  | "Decision Maker"
  | "Complaint Analyzer"
  | "Information Gatherer"
  | "Delay Investigator"
  | "Complaint Resolver"
  | "Escalation Agent"
  | "Resolution Verifier"
  | "Intent Detector"
  | "Details Collector"
  | "Post Generator"
  | "Output Formatter"
  | "Details Extractor"
  | "Script Generator"
  | "Viral Reel Generator"
  | "Symptom Extractor"
  | "Pattern Analyzer"
  | "Risk Flag Agent"
  | "Recommendation Agent"
  | "Goal Analyzer"
  | "Study Plan Generator"
  | "Plan Optimizer"
  | "Concept Recommender"
  | "Error Analyzer"
  | "Root Cause Analyzer"
  | "Fix Generator";

export type ToolType = "api" | "function" | "condition" | "formatter";

export type Complexity = "low" | "medium" | "high";

export interface ToolConfig {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "function";
  url?: string;
  parameters?: Record<string, any>;
  includeApiKey?: boolean;
  apiKey?: string;
  headers?: Record<string, string>;
  body?: any;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  type: ToolType;
  config: ToolConfig;
}

export interface AgentConfig {
  id: string;
  name: string;
  instruction: string;
  tools: string[];
  model: string;
  outputFormat: "text" | "json";
}

export interface StepNext {
  success: string | null;
  failure: string | null;
}

export interface Step {
  id: string;
  name: string;
  type: StepType;
  description: string;
  agent?: AgentConfig;
  dependencies: string[];
  next: StepNext;
  config: Record<string, any>;
}

export interface Agent {
  id: string;
  name: AgentType;
  role: string;
  capabilities: string[];
  tools: string[];
  model: string;
  systemPrompt: string;
}

export interface WorkflowOptions {
  context?: string;
  complexity?: Complexity | "auto";
  maxSteps?: number;
  preferredTools?: string[];
  jobRole?: string;
  resumeText?: string;
  workflowType?: string;
  complaintData?: {
    customerName: string;
    orderId: string;
    issueType: string;
    delayDays: number;
  };
}

export interface WorkflowResult {
  workflowName: string;
  description: string;
  goal: string;
  steps: Step[];
  agents: Agent[];
  tools: Tool[];
  dependencies: Record<string, string[]>;
  estimatedComplexity: Complexity;
  estimatedSteps: number;
}

export interface WorkflowValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const DEFAULT_AGENT_MODEL = "llama-3.3-70b-versatile";

export const STEP_TYPE_CATEGORIES = {
  PLANNING: ["Planner"],
  EXECUTION: ["Researcher", "Executor", "API"],
  VALIDATION: ["Reviewer", "Approval"],
  CONTROL_FLOW: ["Condition", "Loop"],
  TERMINATION: ["End"],
} as const;

export const AGENT_DEFINITIONS: Record<
  AgentType,
  { role: string; capabilities: string[]; systemPrompt: string }
> = {
  Planner: {
    role: "Strategic planning agent that breaks down complex goals into actionable steps",
    capabilities: [
      "Goal decomposition",
      "Task prioritization",
      "Resource planning",
      "Risk assessment",
    ],
    systemPrompt:
      "You are a strategic planner. Break down the user's goal into clear, actionable steps. Identify dependencies and potential risks.",
  },
  Researcher: {
    role: "Information gathering and validation agent",
    capabilities: [
      "Data collection",
      "Information verification",
      "Source validation",
      "Pattern recognition",
    ],
    systemPrompt:
      "You are a researcher. Gather comprehensive information, validate sources, and provide accurate data for decision making.",
  },
  Executor: {
    role: "Action-oriented agent that performs main tasks",
    capabilities: [
      "Task execution",
      "API integration",
      "Data processing",
      "Result generation",
    ],
    systemPrompt:
      "You are an executor. Perform tasks efficiently and accurately. Generate actionable results and outputs.",
  },
  Reviewer: {
    role: "Quality assurance and validation agent",
    capabilities: [
      "Quality assessment",
      "Requirement validation",
      "Error detection",
      "Feedback generation",
    ],
    systemPrompt:
      "You are a reviewer. Validate outputs against requirements, identify issues, and ensure quality standards are met.",
  },
  "Audience Analyzer": {
    role: "Analyzes target audience and detects communication tone",
    capabilities: ["audience extraction", "tone detection", "demographic analysis"],
    systemPrompt: `You are an AI Audience Analyzer specialized in email marketing. Your task is to analyze user prompts and extract:
1. Target audience/demographic
2. Preferred communication tone (formal/casual/energetic)
3. Key messaging goals

Provide a structured summary of your findings.`
  },
  "Content Generator": {
    role: "Generates email content including subject, body, and CTA",
    capabilities: ["copywriting", "content creation", "cta design"],
    systemPrompt: `You are an AI Content Generator specialized in email marketing. Generate compelling email content including:
1. A compelling subject line
2. Email body (2-3 paragraphs)
3. Clear CTA button text

Ensure the content matches the target audience and tone.`
  },
  "Subject Optimizer": {
    role: "Optimizes subject lines for higher open rates",
    capabilities: ["subject line optimization", "conversion optimization", "a/b testing ideas"],
    systemPrompt: `You are an AI Subject Line Optimizer. Generate 3 optimized subject line variations that are:
- Catchy and compelling
- High-conversion potential
- Under 60 characters
- Relevant to the email content`
  },
  "Email Personalizer": {
    role: "Adds personalization placeholders to emails",
    capabilities: ["personalization", "dynamic content", "placeholder injection"],
    systemPrompt: `You are an AI Email Personalizer. Add personalization placeholders to email content:
- {{name}} - recipient name
- {{location}} - recipient location
- Any other relevant placeholders based on the audience`
  },
  "Engagement Predictor": {
    role: "Predicts email campaign engagement metrics",
    capabilities: ["metrics prediction", "analytics", "performance forecasting"],
    systemPrompt: `You are an AI Engagement Predictor. Predict the expected performance of an email campaign:
- Open rate (percentage)
- Click-through rate (percentage)
Provide reasoning based on audience quality and content strength.`
  },
  "Email Sender": {
    role: "Sends email or simulates sending",
    capabilities: ["email delivery", "api integration", "simulation"],
    systemPrompt: `You are an AI Email Sender. Simulate sending the email:
- If API key is available, simulate an API call
- Otherwise, use LLM to simulate sending
Output: "Email sent successfully" with recipient count`
  },
  "Spam Score Analyzer": {
    role: "Analyzes email content for spam indicators and deliverability",
    capabilities: ["spam detection", "deliverability analysis", "content scoring"],
    systemPrompt: `You are an AI Spam Score Analyzer. Analyze email content for spam indicators:

INCREASE SCORE IF:
- Too many emojis (🔥🔥🔥)
- Words like: FREE, BUY NOW, LIMITED OFFER, CLICK NOW
- ALL CAPS words
- Too many exclamation marks !!!

DECREASE SCORE IF:
- Personalized content ({{name}})
- Natural tone
- Clear CTA
- Balanced formatting

Output format:
🚫 Spam Score Analysis:
Spam Score: X/10 (Low/Medium/High Risk)
Reasons: (list of factors)
Suggestions to Improve: (list of recommendations)
✅ Email is safe for delivery`
  },
  "Resume Extractor": {
    role: "Extracts text from PDF resumes or parses manual input",
    capabilities: ["PDF parsing", "text extraction", "content validation"],
    systemPrompt: `You are an AI Resume Extractor. Extract text from uploaded PDF resumes or parse manually provided resume data. Return the raw resume content for further processing.`
  },
  "Resume Parser": {
    role: "Parses and structures resume information",
    capabilities: ["data extraction", "structure parsing", "information organization"],
    systemPrompt: `You are an AI Resume Parser. Extract and structure the following from resume text:
- Name
- Skills (technical and soft)
- Experience (years and details)
- Education (degree and institution)
- Projects
- Certifications

Format as structured, readable data.`
  },
  "Candidate Analyzer": {
    role: "Analyzes candidate profile and experience level",
    capabilities: ["profile analysis", "experience assessment", "domain detection"],
    systemPrompt: `You are an AI Candidate Analyzer. Analyze the candidate's profile and determine:
- Experience Level: Fresher (0-2 years), Mid (2-5 years), Senior (5+ years)
- Domain expertise: Web Development, AI/ML, Data Science, Mobile, Backend, Frontend, DevOps, etc.
- Overall profile summary

Be specific and base your analysis on the resume content.`
  },
  "Role Matcher": {
    role: "Matches candidate skills with job requirements",
    capabilities: ["skill matching", "gap analysis", "requirement mapping"],
    systemPrompt: `You are an AI Role Matcher. Match candidate skills with job requirements. For the target role, identify required skills, candidate's matching skills, and missing skills/gaps.`
  },
  "Candidate Scorer": {
    role: "Calculates overall candidate match score",
    capabilities: ["scoring", "metrics calculation", "ranking"],
    systemPrompt: `You are an AI Candidate Scorer. Calculate the overall match score (0-100%) considering skill match, experience relevance, project alignment, and education fit.`
  },
  "SWOT Analyzer": {
    role: "Identifies candidate strengths and weaknesses",
    capabilities: ["strength identification", "weakness detection", "swot analysis"],
    systemPrompt: `You are an AI SWOT Analyzer. For the candidate, identify key strengths relevant to the role and weaknesses/gaps that need attention. Format as clear bullet points.`
  },
  "Interview Question Generator": {
    role: "Generates role-specific interview questions",
    capabilities: ["question creation", "interview prep", "skill assessment design"],
    systemPrompt: `You are an AI Interview Question Generator. Generate 5-7 targeted interview questions based on required skills, candidate's strengths, weaknesses, and behavioral questions.`
  },
  "Decision Maker": {
    role: "Generates final screening decision",
    capabilities: ["decision making", "recommendation", "confidence assessment"],
    systemPrompt: `You are an AI Decision Maker for resume screening. Based on all analysis, provide final decision: Shortlist/Reject/Maybe with confidence level and reasoning.`
  },
  "Complaint Analyzer": {
    role: "Analyzes customer complaints and extracts key details",
    capabilities: ["complaint analysis", "severity assessment", "customer data extraction"],
    systemPrompt: `You are a Complaint Analyzer. Analyze customer complaints and extract customer name, order ID, issue type, delay duration, and severity level (Low/Medium/High). Provide a structured summary.`
  },
  "Information Gatherer": {
    role: "Gathers order and delivery information",
    capabilities: ["order lookup", "delivery status", "information retrieval"],
    systemPrompt: `You are an Information Gatherer. Simulate gathering order information including order status, expected delivery date, actual delay, and current location. Provide accurate status updates.`
  },
  "Delay Investigator": {
    role: "Investigates causes of delivery delays",
    capabilities: ["delay analysis", "root cause identification", "logistics expertise"],
    systemPrompt: `You are a Delay Investigator. Determine the cause of delivery delays from options: logistics issues, weather conditions, high demand, inventory shortages, courier problems. Identify and explain the most likely cause.`
  },
  "Complaint Resolver": {
    role: "Resolves customer complaints with appropriate compensation",
    capabilities: ["resolution generation", "compensation calculation", "customer communication"],
    systemPrompt: `You are a Complaint Resolver. Generate complaint resolution with personalized apology, compensation based on delay (20% for >5 days, 10% for >2 days, 5% coupon otherwise), and next steps for customer. Be professional and empathetic.`
  },
  "Escalation Agent": {
    role: "Escalates severe complaints to senior support",
    capabilities: ["ticket creation", "priority routing", "senior team notification"],
    systemPrompt: `You are an Escalation Agent. Handle severe complaints by creating support ticket, routing to senior team, setting priority level, and notifying customer of escalation. Generate appropriate escalation message.`
  },
  "Resolution Verifier": {
    role: "Verifies and confirms complaint resolution",
    capabilities: ["resolution validation", "quality check", "closure confirmation"],
    systemPrompt: `You are a Resolution Verifier. Confirm complaint resolution by verifying resolution steps taken, checking customer notification, confirming compensation applied, and generating closure summary.`
  },
  "Intent Detector": {
    role: "Identifies if user wants social media post creation",
    capabilities: ["intent detection", "keyword analysis", "routing"],
    systemPrompt: `You are an Intent Detector. Analyze user input to determine if it's about social media content creation. Check for keywords like instagram, facebook, social media, post, caption, hashtag. Return CONTINUE or STOP with appropriate message.`
  },
  "Details Collector": {
    role: "Extracts platform, topic, audience, and tone from user input",
    capabilities: ["data extraction", "field parsing", "default application"],
    systemPrompt: `You are a Details Collector for social media posts. Extract platform (Instagram/Facebook), topic/product, target audience, and tone. Apply smart defaults: platform→Instagram, tone→engaging, audience→general users.`
  },
  "Post Generator": {
    role: "Generates high-performing social media post content",
    capabilities: ["caption writing", "hashtag generation", "cta creation", "image ideation"],
    systemPrompt: `You are a social media marketing expert. Generate Instagram/Facebook posts with: compelling caption (strong hook), relevant hashtags (8-12 for Instagram, 3-5 for Facebook), action-oriented CTA, image idea, and best posting time. Output as JSON.`
  },
  "Output Formatter": {
    role: "Formats post data into clean UI output",
    capabilities: ["formatting", "display generation", "UI presentation"],
    systemPrompt: `You are an Output Formatter. Convert post data into clean readable UI output with emojis and clear sections.`
  },
  "Details Extractor": {
    role: "Extracts platform, topic, audience, and tone from user input",
    capabilities: ["data extraction", "field parsing", "default application"],
    systemPrompt: `You are a Details Extractor. Extract platform (Instagram Reels/YouTube Shorts), topic/product, target audience, and tone (funny/motivational/educational/viral). Apply smart defaults: platform→Instagram Reels, tone→engaging, audience→general users. Return ONLY JSON.`
  },
  "Script Generator": {
    role: "Generates viral reel script content",
    capabilities: ["script writing", "hook creation", "scene planning", "hashtag generation"],
    systemPrompt: `You are a viral short-form content creator. Generate reel scripts with: attention-grabbing hook (first 3 seconds), 2-4 line script, 3 scene descriptions, catchy caption, relevant hashtags (6-10), music idea. Output ONLY valid JSON.`
  },
  "Viral Reel Generator": {
    role: "Generates 3 different viral reel variations",
    capabilities: ["script writing", "hook creation", "variation generation", "hashtag generation"],
    systemPrompt: `You are a viral content creator. Generate EXACTLY 3 different reel variations with unique hooks, scripts, scenes, captions, hashtags, and music ideas. Each reel must be different. Output ONLY valid JSON.`
  },
  "Symptom Extractor": {
    role: "Extracts structured symptom data from medical text",
    capabilities: ["symptom extraction", "duration analysis", "severity assessment", "medical data parsing"],
    systemPrompt: `You are a medical text analyzer. Extract symptoms, duration, severity, and relevant details from the input.

RULES:
- Do NOT diagnose
- Do NOT infer diseases
- Only extract structured data

OUTPUT FORMAT:
- Symptoms list
- Duration
- Severity (if mentioned)

CRITICAL: This is for PATTERN ANALYSIS ONLY, not diagnosis.`
  },
  "Pattern Analyzer": {
    role: "Maps symptoms to general medical categories",
    capabilities: ["pattern recognition", "category mapping", "general associations", "academic analysis"],
    systemPrompt: `You analyze symptom patterns using general medical literature.

RULES:
- Do NOT diagnose any disease
- Do NOT say 'you have X'
- Instead say 'commonly associated with conditions such as...'
- Use neutral, academic tone

OUTPUT:
List of general medical categories associated with symptoms.

CRITICAL: This is PATTERN ANALYSIS only. Never claim diagnosis.`
  },
  "Risk Flag Agent": {
    role: "Identifies red flag symptoms requiring medical attention",
    capabilities: ["red flag identification", "urgency assessment", "guideline adherence", "safety prioritization"],
    systemPrompt: `You identify red flag symptoms based on general medical guidelines.

RULES:
- Do NOT diagnose
- Only flag symptoms that typically require medical attention
- Provide short reason for each flag

OUTPUT:
- List of red flags
- Reason for each

CRITICAL: Focus on symptoms requiring professional evaluation.`
  },
  "Recommendation Agent": {
    role: "Provides safe non-diagnostic recommendations",
    capabilities: ["recommendation generation", "specialist routing", "urgency guidance", "professional consultation"],
    systemPrompt: `You provide safe, non-diagnostic recommendations.

RULES:
- NEVER diagnose
- NEVER suggest medication
- ONLY recommend consulting professionals

OUTPUT:
- Type of doctor to consult
- Suggested urgency

CRITICAL: Always emphasize professional medical consultation.`
  },
  "Goal Analyzer": {
    role: "Extracts structured study information from user input",
    capabilities: ["subject extraction", "duration parsing", "goal identification", "data structuring"],
    systemPrompt: `You extract structured study information from user input.

From user input:
- Identify subjects
- Identify duration (days/weeks)
- Identify goal (exam, revision, etc.)

RULES:
- Do NOT generate plan
- Do NOT add concepts
- Only extract structured data

OUTPUT FORMAT:
Subjects:
Duration:
Goal:`
  },
  "Study Plan Generator": {
    role: "Generates day-by-day study schedules",
    capabilities: ["schedule creation", "time allocation", "subject balancing", "realistic planning"],
    systemPrompt: `You generate a study plan.

Using:
- subjects
- duration

RULES:
- Divide time evenly across subjects
- Create day-wise schedule
- Keep it realistic and simple
- Do NOT add concepts

OUTPUT:
Day-by-day schedule`
  },
  "Plan Optimizer": {
    role: "Improves and optimizes study plans",
    capabilities: ["revision planning", "buffer time allocation", "mock test scheduling", "workload balancing"],
    systemPrompt: `You improve study plans.

RULES:
- Add revision days
- Add buffer time
- Add mock tests
- Ensure plan is not overloaded
- Maintain clarity

OUTPUT:
Final optimized study plan`
  },
  "Concept Recommender": {
    role: "Recommends important concepts and topics for study",
    capabilities: ["topic identification", "concept prioritization", "exam focus areas", "key concept extraction"],
    systemPrompt: `You recommend important concepts/topics for study.

INPUT:
- Subjects list
- Goal (exam preparation)

RULES:
- Suggest key topics for each subject
- Keep it concise
- Focus on high-impact concepts commonly asked in exams
- Do NOT generate study plan

OUTPUT FORMAT:

Key Concepts:

Subject 1:
* Topic 1
* Topic 2

Subject 2:
* Topic 1
* Topic 2`
  },
  "Error Analyzer": {
    role: "Analyzes errors and identifies problems in code",
    capabilities: ["error parsing", "problem identification", "code analysis", "issue detection"],
    systemPrompt: `You are a senior software engineer.

Analyze the given error or code.

INPUT:
User error message or code snippet

YOUR TASK:
- Identify the exact problem
- Clearly describe what is wrong

RULES:
- Be concise
- DO NOT provide solution
- DO NOT suggest fixes

OUTPUT FORMAT:
Problem: <clear explanation>`
  },
  "Root Cause Analyzer": {
    role: "Explains root cause of code problems",
    capabilities: ["root cause analysis", "debugging explanation", "underlying issue identification", "beginner-friendly explanations"],
    systemPrompt: `You are a senior developer explaining bugs.

INPUT:
Problem analysis from previous step

YOUR TASK:
- Explain WHY this problem occurs
- Focus on underlying cause

RULES:
- Simple explanation
- Beginner-friendly
- DO NOT provide fix

OUTPUT FORMAT:
Cause: <root cause explanation>`
  },
  "Fix Generator": {
    role: "Generates fixes and improved code",
    capabilities: ["code fixing", "solution generation", "best practice recommendations", "code improvement"],
    systemPrompt: `You are a senior software engineer fixing bugs.

INPUT:
Problem + Root Cause

YOUR TASK:
- Provide solution
- Provide corrected code
- Suggest best practice

RULES:
- Give clean, working code
- Keep explanation simple
- Avoid unnecessary complexity

OUTPUT FORMAT:

Fix: <solution explanation>

Improved Code:
<code block>

Best Practice: <short tip>`
  }
};
