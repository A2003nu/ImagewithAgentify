import { NextRequest, NextResponse } from "next/server";
import { groq } from "@/config/GroqModel";
import { validateWorkflow, enrichWorkflow } from "@/lib/workflow-validator";
import type { WorkflowOptions, WorkflowResult } from "@/types/WorkflowType";
import {
  DEFAULT_AGENT_MODEL,
  AGENT_DEFINITIONS,
} from "@/types/WorkflowType";

const EMAIL_MARKETING_KEYWORDS = [
  "email", "newsletter", "marketing email", "send email", "email campaign",
  "promotional email", "cold email", "bulk email", "email blast", "drip email",
  "automated email", "email marketing", "email campaign", "newsletter campaign"
];

const RESUME_SCREENING_KEYWORDS = [
  "resume", "cv", "analyze resume", "candidate", "hiring", "screen resume",
  "screen candidate", "job application", "applicant", "interview candidate",
  "candidate screening", "resume screening", "evaluate resume", "shortlist candidate"
];

const COMPLAINT_KEYWORDS = [
  "complaint", "customer issue", "late delivery", "refund", "order problem",
  "support", "damaged", "missing item", "wrong item", "delayed order", "order delay",
  "complain", "problem with order", "order not arrived", "shipping issue"
];

const SOCIAL_MEDIA_KEYWORDS = [
  "instagram", "facebook", "social media", "post", "caption", "hashtag",
  "tweet", "linkedin", "tiktok", "social post", "content creator",
  "marketing post", "advertisement", "ad campaign", "social media post"
];

const REEL_KEYWORDS = [
  "reel", "reels", "shorts", "youtube shorts", "video", "tiktok video",
  "video content", "short video", " reels ", "viral video", "video script",
  " reel ", "instagram reel", "youtube short"
];

const VIRAL_REEL_KEYWORDS = [
  "viral", "3 reel", "three reel", "multiple reel", "different reel",
  "3 variation", "variation"
];

const IMAGE_GENERATION_KEYWORDS = [
  "generate image", "create image", "image of", "draw", "picture of",
  "draw a", "create a image", "generate a", "make image", "make a image"
];

const isEmailMarketingPrompt = (goal: string): boolean => {
  const lowerGoal = goal.toLowerCase();
  return EMAIL_MARKETING_KEYWORDS.some(keyword => lowerGoal.includes(keyword));
};

const isResumeScreeningPrompt = (goal: string): boolean => {
  const lowerGoal = goal.toLowerCase();
  return RESUME_SCREENING_KEYWORDS.some(keyword => lowerGoal.includes(keyword));
};

const isCustomerComplaintPrompt = (goal: string): boolean => {
  const lowerGoal = goal.toLowerCase();
  return COMPLAINT_KEYWORDS.some(keyword => lowerGoal.includes(keyword));
};

const isSocialMediaPrompt = (goal: string): boolean => {
  const lowerGoal = goal.toLowerCase();
  return SOCIAL_MEDIA_KEYWORDS.some(keyword => lowerGoal.includes(keyword));
};

const isReelPrompt = (goal: string): boolean => {
  const lowerGoal = goal.toLowerCase();
  return REEL_KEYWORDS.some(keyword => lowerGoal.includes(keyword));
};

const isViralReelPrompt = (goal: string): boolean => {
  const lowerGoal = goal.toLowerCase();
  return VIRAL_REEL_KEYWORDS.some(keyword => lowerGoal.includes(keyword));
};

const isImageGenerationPrompt = (goal: string): boolean => {
  const lowerGoal = goal.toLowerCase();
  return IMAGE_GENERATION_KEYWORDS.some(keyword => lowerGoal.includes(keyword));
};

const generateEmailMarketingWorkflow = (goal: string): WorkflowResult => {
  const audienceMatch = goal.match(/for\s+(?:a\s+)?(\w+(?:\s+\w+)?)\s+(?:users?|audience|people|customers?)/i);
  const targetAudience = audienceMatch ? audienceMatch[1] : "target users";
  
  const toneKeywords = {
    formal: ["professional", "business", "corporate", "formal"],
    casual: ["casual", "friendly", "fun", "relaxed"],
    energetic: ["energetic", "exciting", "dynamic", "vibrant"]
  };
  
  let detectedTone = "casual";
  const lowerGoal = goal.toLowerCase();
  for (const [tone, keywords] of Object.entries(toneKeywords)) {
    if (keywords.some(k => lowerGoal.includes(k))) {
      detectedTone = tone;
      break;
    }
  }

  return {
    workflowName: "Email Marketing Campaign",
    description: `AI-powered email marketing workflow targeting ${targetAudience}`,
    goal: goal,
    steps: [
      {
        id: "step-analyze-audience",
        name: "Analyze Audience",
        type: "Analyzer",
        description: `Extract target audience (${targetAudience}) and detect tone (${detectedTone})`,
        agent: {
          id: "audience-analyzer",
          name: "Audience Analyzer",
          instruction: `Analyze the user prompt and extract: 1) Target audience/ demographic 2) Preferred tone (formal/casual/energetic) 3) Key messaging goals. Output structured summary.`,
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "text"
        },
        dependencies: [],
        next: { success: "step-generate-content", failure: null },
        config: { tone: detectedTone, audience: targetAudience }
      },
      {
        id: "step-generate-content",
        name: "Generate Email Content",
        type: "ContentGenerator",
        description: "Generate subject line, email body, and CTA",
        agent: {
          id: "content-generator",
          name: "Content Generator",
          instruction: `Generate email marketing content including: 1) Compelling subject line 2) Email body (2-3 paragraphs) 3) Clear CTA button text. Content should match ${targetAudience} audience and ${detectedTone} tone.`,
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "text"
        },
        dependencies: ["step-analyze-audience"],
        next: { success: "step-optimize-subject", failure: null },
        config: {}
      },
      {
        id: "step-optimize-subject",
        name: "Optimize Subject Line",
        type: "Optimizer",
        description: "Generate 3 improved subject line options",
        agent: {
          id: "subject-optimizer",
          name: "Subject Optimizer",
          instruction: "Generate 3 optimized subject line variations that are catchy, high-conversion, and compelling. Each should be under 60 characters.",
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "text"
        },
        dependencies: ["step-generate-content"],
        next: { success: "step-personalize", failure: null },
        config: {}
      },
      {
        id: "step-personalize",
        name: "Personalize Email",
        type: "Personalizer",
        description: "Add personalization placeholders",
        agent: {
          id: "email-personalizer",
          name: "Email Personalizer",
          instruction: "Add personalization placeholders to the email: {{name}}, {{location}}, and any other relevant placeholders. Adjust tone for the target audience.",
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "text"
        },
        dependencies: ["step-optimize-subject"],
        next: { success: "step-predict-engagement", failure: null },
        config: {}
      },
      {
        id: "step-predict-engagement",
        name: "Predict Engagement",
        type: "Predictor",
        description: "Predict open rate and click rate",
        agent: {
          id: "engagement-predictor",
          name: "Engagement Predictor",
          instruction: "Predict the expected open rate (%) and click-through rate (%) for this email campaign. Provide a brief reasoning for your predictions based on audience and content quality.",
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "text"
        },
        dependencies: ["step-personalize"],
        next: { success: "step-spam-analysis", failure: null },
        config: {}
      },
      {
        id: "step-spam-analysis",
        name: "Spam Score Analysis",
        type: "SpamAnalyzer",
        description: "Analyze email content for spam indicators",
        agent: {
          id: "spam-analyzer",
          name: "Spam Score Analyzer",
          instruction: "Analyze the email subject and body for spam indicators. Score from 1-10 based on: too many emojis, spam keywords (FREE, BUY NOW, LIMITED OFFER, CLICK NOW), ALL CAPS, excessive exclamation marks. Decrease score for personalization ({{name}}), natural tone, clear CTA, balanced formatting.",
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "text"
        },
        dependencies: ["step-predict-engagement"],
        next: { success: "step-send-email", failure: null },
        config: {}
      },
      {
        id: "step-send-email",
        name: "Send Email",
        type: "Action",
        description: "Send email via API or simulate sending",
        agent: {
          id: "email-sender",
          name: "Email Sender",
          instruction: "If API key exists, simulate sending the email via API. Otherwise, use LLM to simulate sending and output 'Email sent successfully to {{recipient_count}} recipients'.",
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "text"
        },
        dependencies: ["step-spam-analysis"],
        next: { success: "step-end", failure: null },
        config: {}
      },
      {
        id: "step-end",
        name: "End",
        type: "End",
        description: "Workflow completed",
        dependencies: ["step-send-email"],
        next: { success: null, failure: null },
        config: {}
      }
    ],
    agents: [
      {
        id: "audience-analyzer",
        name: "Audience Analyzer",
        role: "Analyzes target audience and detects communication tone",
        capabilities: ["audience extraction", "tone detection", "demographic analysis"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are an AI Audience Analyzer specialized in email marketing. Your task is to analyze user prompts and extract:
1. Target audience/demographic
2. Preferred communication tone (formal/casual/energetic)
3. Key messaging goals

Provide a structured summary of your findings.`
      },
      {
        id: "content-generator",
        name: "Content Generator",
        role: "Generates email content including subject, body, and CTA",
        capabilities: ["copywriting", "content creation", "cta design"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are an AI Content Generator specialized in email marketing. Generate compelling email content including:
1. A compelling subject line
2. Email body (2-3 paragraphs)
3. Clear CTA button text

Ensure the content matches the target audience and tone.`
      },
      {
        id: "subject-optimizer",
        name: "Subject Optimizer",
        role: "Optimizes subject lines for higher open rates",
        capabilities: ["subject line optimization", "conversion optimization", "a/b testing ideas"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are an AI Subject Line Optimizer. Generate 3 optimized subject line variations that are:
- Catchy and compelling
- High-conversion potential
- Under 60 characters
- Relevant to the email content`
      },
      {
        id: "email-personalizer",
        name: "Email Personalizer",
        role: "Adds personalization placeholders to emails",
        capabilities: ["personalization", "dynamic content", "placeholder injection"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are an AI Email Personalizer. Add personalization placeholders to email content:
- {{name}} - recipient name
- {{location}} - recipient location
- Any other relevant placeholders based on the audience`
      },
      {
        id: "engagement-predictor",
        name: "Engagement Predictor",
        role: "Predicts email campaign engagement metrics",
        capabilities: ["metrics prediction", "analytics", "performance forecasting"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are an AI Engagement Predictor. Predict the expected performance of an email campaign:
- Open rate (percentage)
- Click-through rate (percentage)
Provide reasoning based on audience quality and content strength.`
      },
      {
        id: "email-sender",
        name: "Email Sender",
        role: "Sends email or simulates sending",
        capabilities: ["email delivery", "api integration", "simulation"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are an AI Email Sender. Simulate sending the email:
- If API key is available, simulate an API call
- Otherwise, use LLM to simulate sending
Output: "Email sent successfully" with recipient count`
      },
      {
        id: "spam-analyzer",
        name: "Spam Score Analyzer",
        role: "Analyzes email content for spam indicators and deliverability",
        capabilities: ["spam detection", "deliverability analysis", "content scoring"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
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
      }
    ],
    tools: [],
    dependencies: {
      "step-generate-content": ["step-analyze-audience"],
      "step-optimize-subject": ["step-generate-content"],
      "step-personalize": ["step-optimize-subject"],
      "step-predict-engagement": ["step-personalize"],
      "step-spam-analysis": ["step-predict-engagement"],
      "step-send-email": ["step-spam-analysis"],
      "step-end": ["step-send-email"]
    },
    estimatedComplexity: "medium",
    estimatedSteps: 7
  };
};

const generateResumeScreeningWorkflow = (goal: string, jobRole: string): WorkflowResult => {
  return {
    workflowName: "AI Resume Screening",
    description: `AI-powered resume screening for ${jobRole} position`,
    goal: goal,
    steps: [
      {
        id: "step-extract-resume",
        name: "Extract Resume Text",
        type: "PDFParser",
        description: "Extract text content from uploaded PDF resume",
        agent: {
          id: "resume-extractor",
          name: "Resume Extractor",
          instruction: "Extract all text content from the uploaded PDF resume. If no PDF is uploaded, use the manual resume data provided by the user.",
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "text"
        },
        dependencies: [],
        next: { success: "step-parse-data", failure: null },
        config: { isRequired: true }
      },
      {
        id: "step-parse-data",
        name: "Parse Resume Data",
        type: "ResumeParser",
        description: "Parse and structure resume information",
        agent: {
          id: "resume-parser",
          name: "Resume Parser",
          instruction: `Parse the resume text and extract: Name, Skills (technical and soft), Experience (years and details), Education (degree and institution), Projects (if any), Certifications. Format as structured data.`,
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "text"
        },
        dependencies: ["step-extract-resume"],
        next: { success: "step-analyze-candidate", failure: null },
        config: {}
      },
      {
        id: "step-analyze-candidate",
        name: "Analyze Candidate",
        type: "Analyzer",
        description: "Analyze candidate profile and experience level",
        agent: {
          id: "candidate-analyzer",
          name: "Candidate Analyzer",
          instruction: "Analyze the candidate's profile. Determine: Experience Level (Fresher/Mid/Senior), Domain expertise (Web/AI/Data/Mobile/etc), Overall profile summary. Be specific based on the resume content.",
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "text"
        },
        dependencies: ["step-parse-data"],
        next: { success: "step-match-role", failure: null },
        config: {}
      },
      {
        id: "step-match-role",
        name: "Match With Job Role",
        type: "RoleMatcher",
        description: "Match candidate skills with job requirements",
        agent: {
          id: "role-matcher",
          name: "Role Matcher",
          instruction: `Analyze how well the candidate matches the job role: "${jobRole}". Identify required skills for this role (use LLM to generate relevant skills), List candidate's matching skills, Identify missing/skills gap, Calculate match percentage.`,
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "text"
        },
        dependencies: ["step-analyze-candidate"],
        next: { success: "step-score-candidate", failure: null },
        config: { jobRole }
      },
      {
        id: "step-score-candidate",
        name: "Score Candidate",
        type: "Scorer",
        description: "Calculate overall candidate score",
        agent: {
          id: "candidate-scorer",
          name: "Candidate Scorer",
          instruction: `Calculate overall match score (0-100%) for the ${jobRole} position. Consider: Skill match %, Experience relevance, Project alignment, Education fit. Provide detailed breakdown.`,
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "text"
        },
        dependencies: ["step-match-role"],
        next: { success: "step-strength-weakness", failure: null },
        config: {}
      },
      {
        id: "step-strength-weakness",
        name: "Strengths & Weaknesses",
        type: "Reviewer",
        description: "Identify candidate strengths and areas for improvement",
        agent: {
          id: "swot-analyzer",
          name: "SWOT Analyzer",
          instruction: "Identify the candidate's key strengths relevant to the role and weaknesses/gaps that need attention. Format as clear bullet points.",
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "text"
        },
        dependencies: ["step-score-candidate"],
        next: { success: "step-generate-questions", failure: null },
        config: {}
      },
      {
        id: "step-generate-questions",
        name: "Generate Interview Questions",
        type: "QuestionGenerator",
        description: "Generate role-specific interview questions",
        agent: {
          id: "question-generator",
          name: "Interview Question Generator",
          instruction: `Generate 5-7 interview questions tailored for the ${jobRole} position. Include questions based on: Required skills from the role, Candidate's strengths, Candidate's weaknesses/gaps, Behavioral questions.`,
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "text"
        },
        dependencies: ["step-strength-weakness"],
        next: { success: "step-final-decision", failure: null },
        config: {}
      },
      {
        id: "step-final-decision",
        name: "Final Decision",
        type: "DecisionMaker",
        description: "Generate final screening decision",
        agent: {
          id: "decision-maker",
          name: "Decision Maker",
          instruction: "Based on all analysis, provide final decision: Shortlist / Reject / Maybe. Include confidence level (Low/Medium/High) and clear reasoning. Summary should be recruiter-ready.",
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "text"
        },
        dependencies: ["step-generate-questions"],
        next: { success: "step-end", failure: null },
        config: {}
      },
      {
        id: "step-end",
        name: "End",
        type: "End",
        description: "Screening completed",
        dependencies: ["step-final-decision"],
        next: { success: null, failure: null },
        config: {}
      }
    ],
    agents: [
      {
        id: "resume-extractor",
        name: "Resume Extractor",
        role: "Extracts text from PDF resumes or parses manual input",
        capabilities: ["PDF parsing", "text extraction", "content validation"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are an AI Resume Extractor. Extract text from uploaded PDF resumes or parse manually provided resume data. Return the raw resume content for further processing.`
      },
      {
        id: "resume-parser",
        name: "Resume Parser",
        role: "Parses and structures resume information",
        capabilities: ["data extraction", "structure parsing", "information organization"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are an AI Resume Parser. Extract and structure the following from resume text:
- Name
- Skills (technical and soft)
- Experience (years and details)
- Education (degree and institution)
- Projects
- Certifications

Format as structured, readable data.`
      },
      {
        id: "candidate-analyzer",
        name: "Candidate Analyzer",
        role: "Analyzes candidate profile and experience level",
        capabilities: ["profile analysis", "experience assessment", "domain detection"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are an AI Candidate Analyzer. Analyze the candidate's profile and determine:
- Experience Level: Fresher (0-2 years), Mid (2-5 years), Senior (5+ years)
- Domain expertise: Web Development, AI/ML, Data Science, Mobile, Backend, Frontend, DevOps, etc.
- Overall profile summary

Be specific and base your analysis on the resume content.`
      },
      {
        id: "role-matcher",
        name: "Role Matcher",
        role: "Matches candidate skills with job requirements",
        capabilities: ["skill matching", "gap analysis", "requirement mapping"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are an AI Role Matcher. Match candidate skills with job requirements.

For the target role, identify:
1. Required skills (generate based on common requirements for this role type)
2. Candidate's matching skills (from resume)
3. Missing skills/gaps
4. Match percentage

Be specific and practical in your analysis.`
      },
      {
        id: "candidate-scorer",
        name: "Candidate Scorer",
        role: "Calculates overall candidate match score",
        capabilities: ["scoring", "metrics calculation", "ranking"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are an AI Candidate Scorer. Calculate the overall match score (0-100%) considering:
- Skill match percentage
- Experience relevance to role
- Project alignment
- Education fit
- Overall fit for ${jobRole}

Provide a detailed breakdown of how the score was calculated.`
      },
      {
        id: "swot-analyzer",
        name: "SWOT Analyzer",
        role: "Identifies candidate strengths and weaknesses",
        capabilities: ["strength identification", "weakness detection", "swot analysis"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are an AI SWOT Analyzer. For the candidate targeting ${jobRole}:

STRENGTHS (what they have that matches the role):
- Relevant technical skills
- Experience that applies
- Strong projects or achievements

WEAKNESSES (gaps or areas needing development):
- Missing role-specific skills
- Experience gaps
- Areas needing improvement

Format as clear, actionable bullet points.`
      },
      {
        id: "question-generator",
        name: "Interview Question Generator",
        role: "Generates role-specific interview questions",
        capabilities: ["question creation", "interview prep", "skill assessment design"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are an AI Interview Question Generator. Generate 5-7 targeted interview questions for ${jobRole} position based on:
- Required skills for the role
- Candidate's identified strengths
- Candidate's weaknesses/gaps to probe
- 2-3 behavioral questions (STAR format)

Make questions specific and actionable.`
      },
      {
        id: "decision-maker",
        name: "Decision Maker",
        role: "Generates final screening decision",
        capabilities: ["decision making", "recommendation", "confidence assessment"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are an AI Decision Maker for resume screening. Based on all analysis:

FINAL DECISION:
- Shortlist: Score >= 70% and good role match
- Maybe: Score 50-70% or some concerns
- Reject: Score < 50% or major gaps

Include:
- Confidence Level: Low/Medium/High
- Key reasoning for decision
- Recruiter-ready summary

Make decisive recommendations.`
      }
    ],
    tools: [],
    dependencies: {
      "step-extract-resume": [],
      "step-parse-data": ["step-extract-resume"],
      "step-analyze-candidate": ["step-parse-data"],
      "step-match-role": ["step-analyze-candidate"],
      "step-score-candidate": ["step-match-role"],
      "step-strength-weakness": ["step-score-candidate"],
      "step-generate-questions": ["step-strength-weakness"],
      "step-final-decision": ["step-generate-questions"],
      "step-end": ["step-final-decision"]
    },
    estimatedComplexity: "medium",
    estimatedSteps: 9
  };
};

const generateCustomerComplaintWorkflow = (
  goal: string,
  complaintData?: {
    customerName: string;
    orderId: string;
    issueType: string;
    delayDays: number;
  }
): WorkflowResult => {
  const customerName = complaintData?.customerName || "Customer";
  const orderId = complaintData?.orderId || "N/A";
  const issueType = complaintData?.issueType || "General Issue";
  const delayDays = complaintData?.delayDays || 0;

  const severity = delayDays > 3 ? "High" : delayDays > 1 ? "Medium" : "Low";
  const needsEscalation = delayDays > 3 || severity === "High";

  return {
    workflowName: "Customer Complaint Resolution",
    description: `AI-powered customer complaint resolution for ${customerName}'s order ${orderId}`,
    goal: goal,
    steps: [
      {
        id: "step-analyze-complaint",
        name: "Analyze Complaint",
        type: "Analyzer",
        description: `Analyze complaint details: Customer ${customerName}, Order ${orderId}, Issue: ${issueType}, Delay: ${delayDays} days`,
        agent: {
          id: "complaint-analyzer",
          name: "Complaint Analyzer",
          instruction: `Analyze the customer complaint and provide structured details:
- Customer Name: ${customerName}
- Order ID: ${orderId}
- Issue Type: ${issueType}
- Delay: ${delayDays} days
- Severity Level: ${severity}

Output a summary: "Customer ${customerName} reported a ${issueType} issue for Order #${orderId} with a delay of ${delayDays} days. Severity: ${severity}"`,
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "text"
        },
        dependencies: [],
        next: { success: "step-gather-info", failure: null },
        config: { severity, delayDays, customerName, orderId, issueType }
      },
      {
        id: "step-gather-info",
        name: "Gather Information",
        type: "Researcher",
        description: "Simulate order status and delivery information",
        agent: {
          id: "info-gatherer",
          name: "Information Gatherer",
          instruction: `Simulate gathering order information for Order ${orderId}:

ORDER STATUS: "Shipped but delayed"
EXPECTED DELIVERY: ${delayDays > 0 ? `${delayDays} days ago` : "Today"}
ACTUAL DELAY: ${delayDays} days

Generate a realistic status summary.`,
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "text"
        },
        dependencies: ["step-analyze-complaint"],
        next: { success: "step-investigate-delay", failure: null },
        config: {}
      },
      {
        id: "step-investigate-delay",
        name: "Investigate Delay",
        type: "Researcher",
        description: "Determine cause of delay",
        agent: {
          id: "delay-investigator",
          name: "Delay Investigator",
          instruction: `Investigate the cause of delay for Order ${orderId}:

Based on the issue type "${issueType}" and delay of ${delayDays} days, generate a realistic reason. Options:
- Logistics delay in delivery region
- High demand period
- Weather disruption
- Inventory shortage
- Courier operational issues

Output: "Delay caused due to [reason]"`,
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "text"
        },
        dependencies: ["step-gather-info"],
        next: { success: needsEscalation ? "step-escalate" : "step-resolve", failure: null },
        config: {}
      },
      {
        id: "step-resolve",
        name: "Resolve Complaint",
        type: "Executor",
        description: "Generate resolution with compensation",
        agent: {
          id: "complaint-resolver",
          name: "Complaint Resolver",
          instruction: `Resolve the complaint for ${customerName} (Order ${orderId}):

ISSUE: ${issueType}
DELAY: ${delayDays} days
SEVERITY: ${severity}

Generate resolution:
1. Personalized apology mentioning customer name
2. Compensation:
   - ${delayDays > 5 ? "20% refund" : delayDays > 2 ? "10% refund" : "5% discount coupon"}
3. Next steps for the customer

Make it professional and empathetic.`,
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "text"
        },
        dependencies: needsEscalation ? [] : ["step-investigate-delay"],
        next: { success: "step-verify", failure: null },
        config: {}
      },
      {
        id: "step-escalate",
        name: "Escalate Complaint",
        type: "Action",
        description: "Escalate to senior support team if severe",
        agent: {
          id: "escalation-agent",
          name: "Escalation Agent",
          instruction: `Escalate the complaint to senior support team:

CUSTOMER: ${customerName}
ORDER: ${orderId}
ISSUE: ${issueType}
DELAY: ${delayDays} days
SEVERITY: ${severity}

REASON FOR ESCALATION: ${delayDays > 3 ? "Delay exceeds 3 days" : "High severity issue"}

Output: "Issue escalated to senior support team. Ticket created. Customer will be contacted within 24 hours."`,
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "text"
        },
        dependencies: ["step-investigate-delay"],
        next: { success: "step-verify", failure: null },
        config: { escalated: true }
      },
      {
        id: "step-verify",
        name: "Verify Resolution",
        type: "Reviewer",
        description: "Confirm complaint resolution",
        agent: {
          id: "resolution-verifier",
          name: "Resolution Verifier",
          instruction: `Verify that the complaint has been resolved:

- Customer: ${customerName}
- Order ID: ${orderId}
- Issue: ${issueType}
- Delay: ${delayDays} days
- Status: ${needsEscalation ? "Escalated to senior team" : "Resolved"}

Output: "Complaint for Order #${orderId} has been ${needsEscalation ? "escalated" : "resolved"}. Customer ${customerName} ${needsEscalation ? "will be contacted shortly" : "has been compensated."}"`,
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "text"
        },
        dependencies: needsEscalation ? ["step-escalate"] : ["step-resolve"],
        next: { success: "step-end", failure: null },
        config: {}
      },
      {
        id: "step-end",
        name: "End",
        type: "End",
        description: "Workflow completed",
        dependencies: ["step-verify"],
        next: { success: null, failure: null },
        config: {}
      }
    ],
    agents: [
      {
        id: "complaint-analyzer",
        name: "Complaint Analyzer",
        role: "Analyzes customer complaints and extracts key details",
        capabilities: ["complaint analysis", "severity assessment", "customer data extraction"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are a Complaint Analyzer. Analyze customer complaints and extract:
- Customer name
- Order ID
- Issue type
- Delay duration
- Severity level (Low/Medium/High)

Provide a structured summary.`
      },
      {
        id: "info-gatherer",
        name: "Information Gatherer",
        role: "Gathers order and delivery information",
        capabilities: ["order lookup", "delivery status", "information retrieval"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are an Information Gatherer. Simulate gathering order information:
- Order status
- Expected delivery date
- Actual delay
- Current location

Provide accurate status updates.`
      },
      {
        id: "delay-investigator",
        name: "Delay Investigator",
        role: "Investigates causes of delivery delays",
        capabilities: ["delay analysis", "root cause identification", "logistics expertise"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are a Delay Investigator. Determine the cause of delivery delays:
- Logistics issues
- Weather conditions
- High demand
- Inventory shortages
- Courier problems

Identify and explain the most likely cause.`
      },
      {
        id: "complaint-resolver",
        name: "Complaint Resolver",
        role: "Resolves customer complaints with appropriate compensation",
        capabilities: ["resolution generation", "compensation calculation", "customer communication"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are a Complaint Resolver. Generate complaint resolution:
- Personalized apology
- Compensation based on delay
- Next steps for customer

Be professional and empathetic.`
      },
      {
        id: "escalation-agent",
        name: "Escalation Agent",
        role: "Escalates severe complaints to senior support",
        capabilities: ["ticket creation", "priority routing", "senior team notification"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are an Escalation Agent. Handle severe complaints:
- Create support ticket
- Route to senior team
- Set priority level
- Notify customer of escalation

Generate appropriate escalation message.`
      },
      {
        id: "resolution-verifier",
        name: "Resolution Verifier",
        role: "Verifies and confirms complaint resolution",
        capabilities: ["resolution validation", "quality check", "closure confirmation"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are a Resolution Verifier. Confirm complaint resolution:
- Verify resolution steps taken
- Check customer notification
- Confirm compensation applied
- Generate closure summary`
      }
    ],
    tools: [],
    dependencies: {
      "step-analyze-complaint": [],
      "step-gather-info": ["step-analyze-complaint"],
      "step-investigate-delay": ["step-gather-info"],
      "step-resolve": needsEscalation ? [] : ["step-investigate-delay"],
      "step-escalate": needsEscalation ? ["step-investigate-delay"] : [],
      "step-verify": needsEscalation ? ["step-escalate"] : ["step-resolve"],
      "step-end": ["step-verify"]
    },
    estimatedComplexity: "medium",
    estimatedSteps: 6
  };
};

const generateSocialMediaPostWorkflow = (goal: string): WorkflowResult => {
  const lowerGoal = goal.toLowerCase();
  
  let platform = "Instagram";
  if (lowerGoal.includes("facebook") || lowerGoal.includes("fb")) {
    platform = "Facebook";
  } else if (lowerGoal.includes("linkedin")) {
    platform = "LinkedIn";
  } else if (lowerGoal.includes("tiktok")) {
    platform = "TikTok";
  }
  
  let targetAudience = "general users";
  const audienceMatch = goal.match(/targeting\s+([a-zA-Z0-9\s]+?)(?:\s|$|,)/i);
  if (audienceMatch) {
    targetAudience = audienceMatch[1].trim();
  }
  
  let tone = "engaging";
  const toneKeywords: Record<string, string[]> = {
    funny: ["funny", "humor", "hilarious", "joke"],
    professional: ["professional", "business", "formal", "corporate"],
    motivational: ["motivational", "inspiring", "inspiration", "empower"],
    casual: ["casual", "casual", "relaxed", "friendly"],
    energetic: ["energetic", "exciting", "vibrant", "dynamic"]
  };
  
  for (const [toneName, keywords] of Object.entries(toneKeywords)) {
    if (keywords.some(k => lowerGoal.includes(k))) {
      tone = toneName;
      break;
    }
  }

  let topic = "general";
  const topicPatterns = [
    /(?:for|about|on)\s+(?:a\s+)?([a-zA-Z0-9\s]+?)(?:\s+target|$)/i,
    /(?:app|product|service|brand)\s+(?:called|named)?\s*([a-zA-Z0-9]+)/i
  ];
  for (const pattern of topicPatterns) {
    const match = goal.match(pattern);
    if (match) {
      topic = match[1].trim();
      break;
    }
  }

  const isInstagram = platform === "Instagram";
  const hashtagCount = isInstagram ? "8-12" : "3-5";

  return {
    workflowName: "Social Media Post Creation",
    description: `AI-powered ${platform} post generation for ${topic}`,
    goal: goal,
    steps: [
      {
        id: "step-detect-intent",
        name: "Detect Intent",
        type: "Analyzer",
        description: "Identify if user wants to create a social media post",
        agent: {
          id: "intent-detector",
          name: "Intent Detector",
          instruction: `Analyze the user input to detect if it's about social media content creation. 
          
INPUT: ${goal}

Check for keywords: instagram, facebook, social media, post, caption, hashtag, content, marketing, advertisement.

If NOT related to social media content creation, output exactly: "STOP: This agent only handles social media post creation requests"

If related to social media, output: "CONTINUE: Social media post creation detected"`,
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "text"
        },
        dependencies: [],
        next: { success: "step-collect-details", failure: "step-end" },
        config: {}
      },
      {
        id: "step-collect-details",
        name: "Collect Details",
        type: "Analyzer",
        description: `Extract platform (${platform}), topic (${topic}), audience (${targetAudience}), tone (${tone})`,
        agent: {
          id: "details-collector",
          name: "Details Collector",
          instruction: `Extract the following details from user input:

USER INPUT: "${goal}"

- Platform: Instagram or Facebook (default to Instagram if not specified)
- Topic/Product: what is being promoted
- Audience: target audience (default to "general users" if not specified)
- Tone: funny, professional, motivational, casual, energetic (default to "engaging" if not specified)

Apply these defaults if missing:
- Platform → Instagram
- Tone → engaging
- Audience → general users

Return STRICT JSON only (no text outside JSON):

{
  "platform": "",
  "topic": "",
  "audience": "",
  "tone": ""
}

Do NOT ask questions.
Do NOT explain anything.
Do NOT return anything except JSON.`,
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "json"
        },
        dependencies: ["step-detect-intent"],
        next: { success: "step-generate-post", failure: null },
        config: { platform, topic, audience: targetAudience, tone }
      },
      {
        id: "step-generate-post",
        name: "Generate Post",
        type: "ContentGenerator",
        description: "Generate the social media post content",
        agent: {
          id: "post-generator",
          name: "Post Generator",
          instruction: `You are a social media marketing expert.

Generate output STRICTLY in JSON.

DO NOT return text.
DO NOT explain anything.
DO NOT add extra sentences.

INPUT:
Platform: {context.platform}
Topic: {context.topic}
Audience: {context.audience}
Tone: {context.tone}

OUTPUT FORMAT:

{
  "caption": "2-3 short lines, catchy, with emojis",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6", "#tag7", "#tag8"],
  "cta": "short call to action",
  "imageIdea": "short visual idea",
  "bestTimeToPost": "time"
}

STRICT RULES:

- Caption MUST be max 3 lines
- Each line short and punchy
- Start with strong hook
- No long paragraphs
- No placeholders
- No explanations
- No questions
- If unsure → assume realistic values
- Output ONLY valid JSON`,
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "json"
        },
        dependencies: ["step-collect-details"],
        next: { success: "step-format-output", failure: null },
        config: { platform, topic, audience: targetAudience, tone }
      },
      {
        id: "step-format-output",
        name: "Format Output",
        type: "Executor",
        description: "Convert post data to clean UI output",
        agent: {
          id: "output-formatter",
          name: "Output Formatter",
          instruction: `You are a strict formatter.

You will ONLY format given JSON.

You are NOT allowed to:
- Add explanations
- Add extra text
- Add headers
- Add analysis
- Add any sentences

If you do, the output is WRONG.

FORMAT:

📱 Platform: {context.platform}

🔥 Caption:
{context.postData.caption}

🏷️ Hashtags:
{context.postData.hashtags}

🎯 CTA:
{context.postData.cta}

🖼️ Image Idea:
{context.postData.imageIdea}

⏰ Best Time:
{context.postData.bestTimeToPost}

OUTPUT ONLY THIS.`,
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "text"
        },
        dependencies: ["step-generate-post"],
        next: { success: "step-end", failure: null },
        config: {}
      },
      {
        id: "step-end",
        name: "End",
        type: "End",
        description: "Return final output",
        dependencies: ["step-format-output"],
        next: { success: null, failure: null },
        config: {}
      }
    ],
    agents: [
      {
        id: "intent-detector",
        name: "Intent Detector",
        role: "Identifies if user wants social media post creation",
        capabilities: ["intent detection", "keyword analysis", "routing"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are an Intent Detector. Analyze user input to determine if it's about social media content creation. Check for keywords like instagram, facebook, social media, post, caption, hashtag. Return CONTINUE or STOP with appropriate message.`
      },
      {
        id: "details-collector",
        name: "Details Collector",
        role: "Extracts platform, topic, audience, and tone from user input",
        capabilities: ["data extraction", "field parsing", "default application"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are a Details Collector for social media posts. Extract platform (Instagram/Facebook), topic/product, target audience, and tone. Apply smart defaults: platform→Instagram, tone→engaging, audience→general users.`
      },
      {
        id: "post-generator",
        name: "Post Generator",
        role: "Generates high-performing social media post content",
        capabilities: ["caption writing", "hashtag generation", "cta creation", "image ideation"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are a social media marketing expert. Generate Instagram/Facebook posts with: compelling caption (strong hook), relevant hashtags (8-12 for Instagram, 3-5 for Facebook), action-oriented CTA, image idea, and best posting time. Output as JSON.`
      },
      {
        id: "output-formatter",
        name: "Output Formatter",
        role: "Formats post data into clean UI output",
        capabilities: ["formatting", "display generation", "UI presentation"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are an Output Formatter. Convert post data into clean readable UI output with emojis and clear sections.`
      }
    ],
    tools: [],
    dependencies: {
      "step-detect-intent": [],
      "step-collect-details": ["step-detect-intent"],
      "step-generate-post": ["step-collect-details"],
      "step-format-output": ["step-generate-post"],
      "step-end": ["step-format-output"]
    },
    estimatedComplexity: "low",
    estimatedSteps: 5
  };
};

const generateReelScriptWorkflow = (goal: string): WorkflowResult => {
  const lowerGoal = goal.toLowerCase();
  
  let platform = "Instagram Reels";
  if (lowerGoal.includes("youtube") || lowerGoal.includes("shorts")) {
    platform = "YouTube Shorts";
  } else if (lowerGoal.includes("tiktok")) {
    platform = "TikTok";
  }
  
  let targetAudience = "general users";
  const audienceMatch = goal.match(/targeting\s+([a-zA-Z0-9\s]+?)(?:\s|$|,)/i);
  if (audienceMatch) {
    targetAudience = audienceMatch[1].trim();
  }
  
  let tone = "engaging";
  const toneKeywords: Record<string, string[]> = {
    funny: ["funny", "humor", "hilarious", "joke"],
    motivational: ["motivational", "inspiring", "inspiration", "empower"],
    educational: ["educational", "learn", "tutorial", "how to"],
    viral: ["viral", "trending", "popular"]
  };
  
  for (const [toneName, keywords] of Object.entries(toneKeywords)) {
    if (keywords.some(k => lowerGoal.includes(k))) {
      tone = toneName;
      break;
    }
  }

  let topic = "general";
  const topicMatch = goal.match(/(?:for|about|on)\s+(?:a\s+)?([a-zA-Z0-9\s]+?)(?:\s+target|$)/i);
  if (topicMatch) {
    topic = topicMatch[1].trim();
  }

  return {
    workflowName: "Reel Script Generator",
    description: `AI-powered ${platform} script generation for ${topic}`,
    goal: goal,
    steps: [
      {
        id: "step-detect-intent",
        name: "Detect Intent",
        type: "Analyzer",
        description: "Detect if user wants reel/video content",
        agent: {
          id: "intent-detector",
          name: "Intent Detector",
          instruction: `Detect if user wants reel/video content.

INPUT: ${goal}

Check for keywords: reel, reels, shorts, youtube shorts, video, tiktok, video content, short video, viral video, video script

If NOT related to video/reel content, output exactly: "STOP: This agent only handles reel/video script creation requests"

If related to video/reel content, output: "CONTINUE: Reel script creation detected"`,
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "text"
        },
        dependencies: [],
        next: { success: "step-extract-details", failure: "step-end" },
        config: {}
      },
      {
        id: "step-extract-details",
        name: "Extract Details",
        type: "Analyzer",
        description: `Extract platform (${platform}), topic (${topic}), audience (${targetAudience}), tone (${tone})`,
        agent: {
          id: "details-extractor",
          name: "Details Extractor",
          instruction: `Extract from user input:

USER INPUT: "${goal}"

Return ONLY JSON:

{
  "platform": "",
  "topic": "",
  "audience": "",
  "tone": ""
}

Apply defaults if missing:
- platform → Instagram Reels
- tone → engaging
- audience → general users

STRICT RULES:
- Do NOT ask user questions
- Do NOT request more information
- Do NOT explain anything
- Return ONLY JSON`,
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "json"
        },
        dependencies: ["step-detect-intent"],
        next: { success: "step-generate-script", failure: null },
        config: { platform, topic, audience: targetAudience, tone }
      },
      {
        id: "step-generate-script",
        name: "Generate Reel Script",
        type: "ContentGenerator",
        description: "Generate the reel script content",
        agent: {
          id: "script-generator",
          name: "Script Generator",
          instruction: `You are a viral short-form content creator.

Generate output STRICTLY in JSON.

DO NOT return text.
DO NOT explain anything.
DO NOT include extra sentences.

OUTPUT FORMAT:

{
  "hook": "",
  "script": "",
  "scenes": [
    {"scene": 1, "description": ""},
    {"scene": 2, "description": ""},
    {"scene": 3, "description": ""}
  ],
  "caption": "",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6"],
  "musicIdea": ""
}

STRICT RULES:

- Hook must grab attention in first 3 seconds
- Script must be 2-4 short lines only
- Scenes must be short and visual
- Caption must be catchy (1-2 lines)
- Hashtags must be relevant (6-10 max)
- Music idea must be short (1 line)

CRITICAL:
- NO explanations
- NO placeholders
- NO questions
- NO additional sections
- NEVER output anything outside JSON

If output is not JSON → regenerate internally.`,
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "json"
        },
        dependencies: ["step-extract-details"],
        next: { success: "step-format-output", failure: null },
        config: { platform, topic, audience: targetAudience, tone }
      },
      {
        id: "step-format-output",
        name: "Format Output",
        type: "Executor",
        description: "Convert script data to clean UI output",
        agent: {
          id: "output-formatter",
          name: "Output Formatter",
          instruction: `You are a strict formatter.

Your job is ONLY to format data.
You must NOT think, explain, or add text.

STRICT RULES:
- DO NOT add explanations
- DO NOT add introductory text
- DO NOT mention tools
- DO NOT add extra sections
- DO NOT modify content

OUTPUT FORMAT:

🎬 Reel Script

🎯 Hook:
{context.reelData.hook}

📝 Script:
{context.reelData.script}

🎥 Scenes:
{context.reelData.scenes}

✍️ Caption:
{context.reelData.caption}

🏷️ Hashtags:
{context.reelData.hashtags}

🎵 Music Idea:
{context.reelData.musicIdea}

Return ONLY this.`,
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "text"
        },
        dependencies: ["step-generate-script"],
        next: { success: "step-end", failure: null },
        config: {}
      },
      {
        id: "step-end",
        name: "End",
        type: "End",
        description: "Return final output",
        dependencies: ["step-format-output"],
        next: { success: null, failure: null },
        config: {}
      }
    ],
    agents: [
      {
        id: "intent-detector",
        name: "Intent Detector",
        role: "Detects if user wants reel/video content",
        capabilities: ["intent detection", "keyword analysis", "routing"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are an Intent Detector. Analyze user input to determine if it's about reel/video content. Check for keywords like reel, shorts, video, tiktok. Return CONTINUE or STOP with appropriate message.`
      },
      {
        id: "details-extractor",
        name: "Details Extractor",
        role: "Extracts platform, topic, audience, and tone from user input",
        capabilities: ["data extraction", "field parsing", "default application"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are a Details Extractor. Extract platform (Instagram Reels/YouTube Shorts), topic/product, target audience, and tone (funny/motivational/educational/viral). Apply smart defaults: platform→Instagram Reels, tone→engaging, audience→general users. Return ONLY JSON.`
      },
      {
        id: "script-generator",
        name: "Script Generator",
        role: "Generates viral reel script content",
        capabilities: ["script writing", "hook creation", "scene planning", "hashtag generation"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are a viral short-form content creator. Generate reel scripts with: attention-grabbing hook (first 3 seconds), 2-4 line script, 3 scene descriptions, catchy caption, relevant hashtags (6-10), music idea. Output ONLY valid JSON.`
      },
      {
        id: "output-formatter",
        name: "Output Formatter",
        role: "Formats script data into clean UI output",
        capabilities: ["formatting", "display generation", "UI presentation"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are a strict formatter. Format reel data into clean output with emojis. DO NOT add explanations, introductory text, or extra sections. Output ONLY the formatted result.`
      }
    ],
    tools: [],
    dependencies: {
      "step-detect-intent": [],
      "step-extract-details": ["step-detect-intent"],
      "step-generate-script": ["step-extract-details"],
      "step-format-output": ["step-generate-script"],
      "step-end": ["step-format-output"]
    },
    estimatedComplexity: "low",
    estimatedSteps: 5
  };
};

const generateViralReelWorkflow = (goal: string): WorkflowResult => {
  const lowerGoal = goal.toLowerCase();
  
  let platform = "Instagram Reels";
  if (lowerGoal.includes("youtube") || lowerGoal.includes("shorts")) {
    platform = "YouTube Shorts";
  } else if (lowerGoal.includes("tiktok")) {
    platform = "TikTok";
  }
  
  let targetAudience = "general users";
  const audienceMatch = goal.match(/targeting\s+([a-zA-Z0-9\s]+?)(?:\s|$|,)/i);
  if (audienceMatch) {
    targetAudience = audienceMatch[1].trim();
  }
  
  let tone = "engaging";
  const toneKeywords: Record<string, string[]> = {
    funny: ["funny", "humor", "hilarious", "joke"],
    motivational: ["motivational", "inspiring", "inspiration", "empower"],
    educational: ["educational", "learn", "tutorial", "how to"],
    viral: ["viral", "trending", "popular"]
  };
  
  for (const [toneName, keywords] of Object.entries(toneKeywords)) {
    if (keywords.some(k => lowerGoal.includes(k))) {
      tone = toneName;
      break;
    }
  }

  let topic = "general";
  const topicMatch = goal.match(/(?:for|about|on)\s+(?:a\s+)?([a-zA-Z0-9\s]+?)(?:\s+target|$)/i);
  if (topicMatch) {
    topic = topicMatch[1].trim();
  }

  return {
    workflowName: "Viral Reel Generator",
    description: `AI-powered ${platform} viral reel generation for ${topic}`,
    goal: goal,
    steps: [
      {
        id: "step-detect-intent",
        name: "Detect Intent",
        type: "Analyzer",
        description: "Detect if user wants reel/video content",
        agent: {
          id: "intent-detector",
          name: "Intent Detector",
          instruction: `Detect if user wants reel/video content.

INPUT: ${goal}

Check for keywords: reel, reels, shorts, youtube shorts, video, tiktok, video content, short video, viral video, video script

If NOT related to video/reel content, output exactly: "STOP: This agent only handles viral reel creation requests"

If related to video/reel content, output: "CONTINUE: Viral reel creation detected"`,
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "text"
        },
        dependencies: [],
        next: { success: "step-extract-details", failure: "step-end" },
        config: {}
      },
      {
        id: "step-extract-details",
        name: "Extract Details",
        type: "Analyzer",
        description: `Extract platform (${platform}), topic (${topic}), audience (${targetAudience}), tone (${tone})`,
        agent: {
          id: "details-extractor",
          name: "Details Extractor",
          instruction: `Extract from user input:

USER INPUT: "${goal}"

Return ONLY JSON:

{
  "platform": "",
  "topic": "",
  "audience": "",
  "tone": ""
}

Apply defaults if missing:
- platform → Instagram Reels
- tone → engaging
- audience → general users

STRICT RULES:
- Do NOT ask user questions
- Do NOT request more information
- Do NOT explain anything
- Return ONLY JSON`,
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "json"
        },
        dependencies: ["step-detect-intent"],
        next: { success: "step-generate-reels", failure: null },
        config: { platform, topic, audience: targetAudience, tone }
      },
      {
        id: "step-generate-reels",
        name: "Generate Viral Reels",
        type: "ContentGenerator",
        description: "Generate 3 different reel variations",
        agent: {
          id: "viral-reel-generator",
          name: "Viral Reel Generator",
          instruction: `You are a strict JSON generator.

You MUST return ONLY valid JSON.
You are NOT allowed to write explanations, ideas, or paragraphs.

TASK:
Generate exactly 3 viral reel scripts.

OUTPUT FORMAT:

{
  "reels": [
    {
      "hook": "short hook",
      "script": "2-3 short lines",
      "scenes": ["scene1", "scene2", "scene3"],
      "caption": "short caption",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6"],
      "musicIdea": "short idea"
    },
    {
      "hook": "",
      "script": "",
      "scenes": ["", "", ""],
      "caption": "",
      "hashtags": ["", "", "", "", "", ""],
      "musicIdea": ""
    },
    {
      "hook": "",
      "script": "",
      "scenes": ["", "", ""],
      "caption": "",
      "hashtags": ["", "", "", "", "", ""],
      "musicIdea": ""
    }
  ]
}

STRICT RULES:

- DO NOT explain anything
- DO NOT give ideas list
- DO NOT write paragraphs
- DO NOT add headings like "Introduction"
- DO NOT add conclusion
- DO NOT write anything outside JSON

If you do → output is INVALID

Generate ONLY JSON.`,
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "json"
        },
        dependencies: ["step-extract-details"],
        next: { success: "step-format-output", failure: null },
        config: { platform, topic, audience: targetAudience, tone }
      },
      {
        id: "step-format-output",
        name: "Format Output",
        type: "Executor",
        description: "Convert reel data to clean UI output",
        agent: {
          id: "output-formatter",
          name: "Output Formatter",
          instruction: `You are a strict formatter.

Format like this:

🎬 Reel 1

🎯 Hook:
{context.reelData.reels[0].hook}

📝 Script:
{context.reelData.reels[0].script}

🎥 Scenes:
{context.reelData.reels[0].scenes}

✍️ Caption:
{context.reelData.reels[0].caption}

🏷️ Hashtags:
{context.reelData.reels[0].hashtags}

🎵 Music:
{context.reelData.reels[0].musicIdea}

---------------------

🎬 Reel 2

🎯 Hook:
{context.reelData.reels[1].hook}

📝 Script:
{context.reelData.reels[1].script}

🎥 Scenes:
{context.reelData.reels[1].scenes}

✍️ Caption:
{context.reelData.reels[1].caption}

🏷️ Hashtags:
{context.reelData.reels[1].hashtags}

🎵 Music:
{context.reelData.reels[1].musicIdea}

---------------------

🎬 Reel 3

🎯 Hook:
{context.reelData.reels[2].hook}

📝 Script:
{context.reelData.reels[2].script}

🎥 Scenes:
{context.reelData.reels[2].scenes}

✍️ Caption:
{context.reelData.reels[2].caption}

🏷️ Hashtags:
{context.reelData.reels[2].hashtags}

🎵 Music:
{context.reelData.reels[2].musicIdea}

STRICT RULES:

- No extra text
- No explanations
- No headings like "Here is output"
- Only formatted reels`,
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "text"
        },
        dependencies: ["step-generate-reels"],
        next: { success: "step-end", failure: null },
        config: {}
      },
      {
        id: "step-end",
        name: "End",
        type: "End",
        description: "Return final output",
        dependencies: ["step-format-output"],
        next: { success: null, failure: null },
        config: {}
      }
    ],
    agents: [
      {
        id: "intent-detector",
        name: "Intent Detector",
        role: "Detects if user wants reel/video content",
        capabilities: ["intent detection", "keyword analysis", "routing"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are an Intent Detector. Analyze user input to determine if it's about viral reel content. Check for keywords like reel, shorts, video, tiktok, viral. Return CONTINUE or STOP with appropriate message.`
      },
      {
        id: "details-extractor",
        name: "Details Extractor",
        role: "Extracts platform, topic, audience, and tone from user input",
        capabilities: ["data extraction", "field parsing", "default application"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are a Details Extractor. Extract platform (Instagram Reels/YouTube Shorts), topic/product, target audience, and tone. Apply smart defaults: platform→Instagram Reels, tone→engaging, audience→general users. Return ONLY JSON.`
      },
      {
        id: "viral-reel-generator",
        name: "Viral Reel Generator",
        role: "Generates 3 different viral reel variations",
        capabilities: ["script writing", "hook creation", "variation generation", "hashtag generation"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are a viral content creator. Generate EXACTLY 3 different reel variations with unique hooks, scripts, scenes, captions, hashtags, and music ideas. Each reel must be different. Output ONLY valid JSON.`
      },
      {
        id: "output-formatter",
        name: "Output Formatter",
        role: "Formats reel data into clean UI output",
        capabilities: ["formatting", "display generation", "UI presentation"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are a strict formatter. Format 3 reel variations into clean output with separators. DO NOT add explanations, introductory text, or extra sections. Output ONLY the formatted result.`
      }
    ],
    tools: [],
    dependencies: {
      "step-detect-intent": [],
      "step-extract-details": ["step-detect-intent"],
      "step-generate-reels": ["step-extract-details"],
      "step-format-output": ["step-generate-reels"],
      "step-end": ["step-format-output"]
    },
    estimatedComplexity: "medium",
    estimatedSteps: 5
  };
};

const WORKFLOW_GENERATION_PROMPT = `
You are an AI Workflow Architect. Generate a structured workflow JSON based on the user's goal.

CRITICAL RULES:
- Return ONLY valid JSON - no markdown, no explanation, no text
- The JSON must follow this exact structure
- Use generic, reusable components only
- No hardcoded values specific to one domain

WORKFLOW JSON STRUCTURE:
{
  "workflowName": "string - descriptive name for the workflow",
  "description": "string - what this workflow accomplishes",
  "goal": "string - the original user goal",
  "steps": [
    {
      "id": "step-1",
      "name": "string - human readable step name",
      "type": "Planner | Researcher | Executor | Reviewer | Condition | Loop | API | Approval | End",
      "description": "string - what this step does",
      "agent": {
        "id": "agent-id",
        "name": "Planner | Researcher | Executor | Reviewer",
        "instruction": "string - specific instruction for this agent",
        "tools": ["tool-id"],
        "model": "${DEFAULT_AGENT_MODEL}",
        "outputFormat": "text | json"
      },
      "dependencies": ["step-id or empty array"],
      "next": {
        "success": "step-id or null",
        "failure": "step-id or null"
      },
      "config": {}
    }
  ],
  "agents": [
    {
      "id": "planner | researcher | executor | reviewer",
      "name": "Planner | Researcher | Executor | Reviewer",
      "role": "string - detailed role description",
      "capabilities": ["string - capability 1", "string - capability 2"],
      "tools": ["tool-id or empty array"],
      "model": "${DEFAULT_AGENT_MODEL}",
      "systemPrompt": "string - system prompt for this agent"
    }
  ],
  "tools": [
    {
      "id": "tool-id",
      "name": "string - tool name",
      "description": "string - what the tool does",
      "type": "api | function | condition | formatter",
      "config": {
        "method": "GET | POST | function",
        "url": "string - base URL or function name",
        "parameters": {},
        "includeApiKey": false,
        "apiKey": ""
      }
    }
  ],
  "dependencies": {
    "step-id": ["prerequisite-step-id or empty"]
  },
  "estimatedComplexity": "low | medium | high",
  "estimatedSteps": number
}

AGENT DEFINITIONS:
1. Planner: Breaks down the goal into actionable steps, creates execution plan
2. Researcher: Gathers information, validates data, searches resources
3. Executor: Performs main actions, calls APIs, executes tasks
4. Reviewer: Validates results, checks quality, ensures requirements met

STEP TYPES:
- Planner: For initial analysis and planning
- Researcher: For gathering information
- Executor: For performing actions/APIs
- Reviewer: For validation and quality checks
- Condition: For branching logic (if/else)
- Loop: For repetitive tasks
- API: For external API calls
- Approval: For human-in-the-loop checkpoints
- End: Final step, marks workflow completion

TOOL TYPES:
- api: External HTTP API calls
- function: Custom functions/code
- condition: Conditional logic
- formatter: Output formatting

Generate a workflow that:
1. Starts with a Planner to understand and break down the goal
2. Uses Researcher when information gathering is needed
3. Uses Executor for main task execution
4. Uses Reviewer for validation
5. Includes proper dependencies between steps
6. Has clear success/failure paths

Analyze the goal and create an appropriate workflow. Return ONLY the JSON object.
`;

const extractJSON = (text: string): any | null => {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    return null;
  } catch {
    return null;
  }
};

const generateDefaultAgent = (agentType: string) => {
  const definition = AGENT_DEFINITIONS[agentType as keyof typeof AGENT_DEFINITIONS];
  
  if (!definition) {
    return {
      id: agentType.toLowerCase(),
      name: agentType,
      role: `${agentType} agent`,
      capabilities: [],
      tools: [],
      model: DEFAULT_AGENT_MODEL,
      systemPrompt: `You are a ${agentType} agent.`,
    };
  }

  return {
    id: agentType.toLowerCase(),
    name: agentType,
    role: definition.role,
    capabilities: definition.capabilities,
    tools: [],
    model: DEFAULT_AGENT_MODEL,
    systemPrompt: definition.systemPrompt,
  };
};

const enhanceWorkflow = (workflow: any, options?: WorkflowOptions): WorkflowResult => {
  const enhancedAgents = workflow.agents.map((agent: any) => {
    const defaultAgent = generateDefaultAgent(agent.name);
    return {
      ...defaultAgent,
      ...agent,
      tools: agent.tools || [],
      model: agent.model || DEFAULT_AGENT_MODEL,
    };
  });

  const enhancedSteps = workflow.steps.map((step: any, index: number) => {
    const stepId = step.id || `step-${index + 1}`;
    
    return {
      id: stepId,
      name: step.name || `Step ${index + 1}`,
      type: step.type || "Executor",
      description: step.description || "",
      agent: step.agent ? {
        id: step.agent.id || `agent-${index}`,
        name: step.agent.name || "Executor",
        instruction: step.agent.instruction || "",
        tools: step.agent.tools || [],
        model: step.agent.model || DEFAULT_AGENT_MODEL,
        outputFormat: step.agent.outputFormat || "text",
      } : undefined,
      dependencies: step.dependencies || [],
      next: {
        success: step.next?.success || null,
        failure: step.next?.failure || null,
      },
      config: step.config || {},
    };
  });

  return {
    workflowName: workflow.workflowName || "Generated Workflow",
    description: workflow.description || "",
    goal: workflow.goal || "",
    steps: enhancedSteps,
    agents: enhancedAgents,
    tools: workflow.tools || [],
    dependencies: workflow.dependencies || {},
    estimatedComplexity: workflow.estimatedComplexity || "medium",
    estimatedSteps: workflow.estimatedSteps || enhancedSteps.length,
  };
};

const generateImageGenerationWorkflow = (goal: string): WorkflowResult => {
  const workflowResult: WorkflowResult = {
    workflowName: "Image Generation",
    description: "AI-powered image generation using Pollinations API",
    goal: goal,
    steps: [
      {
        id: "step-detect-intent",
        name: "Detect Intent",
        type: "Analyzer",
        description: "Detect if user wants image generation",
        agent: {
          id: "intent-detector",
          name: "Intent Detector",
          instruction: `Analyze the user input to determine if they want to generate an image.
Check for keywords: "generate image", "create image", "image of", "draw", "picture of"
If intent is image-generation, extract the clean subject/description.
Output as JSON: { "intent": "image-generation", "prompt": "clean extracted prompt" }`,
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "json"
        },
        dependencies: [],
        next: { success: "step-extract-prompt", failure: null },
        config: {}
      },
      {
        id: "step-extract-prompt",
        name: "Extract Clean Prompt",
        type: "Analyzer",
        description: "Extract clean prompt for image API",
        agent: {
          id: "prompt-extractor",
          name: "Details Extractor",
          instruction: `Extract a clean image prompt from user input.
Remove all command phrases: "generate image", "create image", "image of", "draw", "picture of"
Keep only the actual subject/description.
Examples:
- Input: "Generate an image of a futuristic robot" → Output: "futuristic robot"
- Input: "Draw a sunset" → Output: "sunset"
- Input: "Picture of a cyberpunk city" → Output: "cyberpunk city"
Output as JSON: { "prompt": "clean prompt" }`,
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "json"
        },
        dependencies: ["step-detect-intent"],
        next: { success: "step-call-api", failure: null },
        config: {}
      },
      {
        id: "step-call-api",
        name: "Call Pollinations API",
        type: "Executor",
        description: "Call Pollinations image API",
        agent: {
          id: "api-caller",
          name: "Executor",
          instruction: `Call the Pollinations API to generate an image.
URL: https://image.pollinations.ai/prompt/{prompt}
Replace {prompt} with the extracted clean prompt.
Return the generated image URL.
Output as JSON: { "imageUrl": "https://...", "prompt": "..." }`,
          tools: ["image-generation"],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "json"
        },
        dependencies: ["step-extract-prompt"],
        next: { success: "step-format-output", failure: null },
        config: {}
      },
      {
        id: "step-format-output",
        name: "Format Output",
        type: "ContentGenerator",
        description: "Format image response for UI",
        agent: {
          id: "output-formatter",
          name: "Output Formatter",
          instruction: `Format the image result for display.
Return a structured response with imageUrl, prompt, and type.
Output as JSON: { "type": "image", "imageUrl": "url", "prompt": "prompt" }`,
          tools: [],
          model: DEFAULT_AGENT_MODEL,
          outputFormat: "json"
        },
        dependencies: ["step-call-api"],
        next: { success: null, failure: null },
        config: {}
      }
    ],
    agents: [
      {
        id: "intent-detector",
        name: "Intent Detector",
        role: "Identifies image generation intent",
        capabilities: ["intent detection", "keyword analysis"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are an Intent Detector specializing in image generation requests. Analyze user input to determine if they want to generate an image.`
      },
      {
        id: "prompt-extractor",
        name: "Details Extractor",
        role: "Extracts clean prompts",
        capabilities: ["text extraction", "prompt cleaning"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are a Prompt Extractor. Extract clean image prompts from user input by removing command phrases.`
      },
      {
        id: "api-caller",
        name: "Executor",
        role: "Calls image generation API",
        capabilities: ["API calls", "image generation"],
        tools: ["image-generation"],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are an API Caller for image generation. Call Pollinations API to generate images.`
      },
      {
        id: "output-formatter",
        name: "Output Formatter",
        role: "Formats image output",
        capabilities: ["formatting", "display generation"],
        tools: [],
        model: DEFAULT_AGENT_MODEL,
        systemPrompt: `You are an Output Formatter. Format image results for UI display.`
      }
    ],
    tools: [
      {
        id: "image-generation",
        name: "image-generation",
        description: "Generate images using Pollinations API",
        type: "api",
        config: {
          method: "GET",
          url: "https://image.pollinations.ai/prompt/{prompt}",
          includeApiKey: false,
          parameters: {}
        }
      }
    ],
    dependencies: {},
    estimatedComplexity: "low",
    estimatedSteps: 4
  };
  
  return workflowResult;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { goal, options } = body as { goal: string; options?: WorkflowOptions };

    if (!goal || typeof goal !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Goal is required and must be a string",
        },
        { status: 400 }
      );
    }

    if (isEmailMarketingPrompt(goal)) {
      console.log("📧 Email marketing prompt detected, generating specialized workflow");
      
      const emailWorkflow = generateEmailMarketingWorkflow(goal);
      
      const enrichedResult = enrichWorkflow(emailWorkflow);
      
      return NextResponse.json(
        {
          success: true,
          workflow: enrichedResult,
          metadata: {
            generatedAt: new Date().toISOString(),
            model: "email-marketing-specialized",
            workflowType: "email-marketing",
            validation: { isValid: true, errors: [], warnings: [] },
          },
        },
        { status: 200 }
      );
    }

    if (isResumeScreeningPrompt(goal)) {
      console.log("📄 Resume screening prompt detected, generating specialized workflow");
      
      const jobRole = options?.jobRole || "General Position";
      const resumeWorkflow = generateResumeScreeningWorkflow(goal, jobRole);
      
      const enrichedResult = enrichWorkflow(resumeWorkflow);
      
      return NextResponse.json(
        {
          success: true,
          workflow: enrichedResult,
          metadata: {
            generatedAt: new Date().toISOString(),
            model: "resume-screening-specialized",
            workflowType: "resume-screening",
            jobRole: jobRole,
            validation: { isValid: true, errors: [], warnings: [] },
          },
        },
        { status: 200 }
      );
    }

    if (isCustomerComplaintPrompt(goal)) {
      console.log("\n🚀 WORKFLOW STARTED - Customer Complaint");
      console.log("🧾 Full Input Data:", { goal, options });
      console.log("📋 Customer complaint keywords detected");
      
      const complaintData = options?.complaintData;
      console.log("📦 Complaint Data:", complaintData);
      
      const complaintWorkflow = generateCustomerComplaintWorkflow(goal, complaintData);
      
      console.log("📦 Nodes to execute:", complaintWorkflow.steps.map(s => s.id));
      
      const enrichedResult = enrichWorkflow(complaintWorkflow);
      
      console.log("🎯 FINAL WORKFLOW OUTPUT:", {
        workflowName: enrichedResult.workflowName,
        steps: enrichedResult.steps.length,
        agents: enrichedResult.agents.length
      });
      
      return NextResponse.json(
        {
          success: true,
          workflow: enrichedResult,
          metadata: {
            generatedAt: new Date().toISOString(),
            model: "customer-complaint-specialized",
            workflowType: "customer-complaint",
            complaintData: complaintData,
            validation: { isValid: true, errors: [], warnings: [] },
          },
        },
        { status: 200 }
      );
    }

    if (isReelPrompt(goal)) {
      if (isViralReelPrompt(goal)) {
        console.log("\n🔥 WORKFLOW STARTED - Viral Reel Generator");
        console.log("🧾 Full Input Data:", { goal, options });
        console.log("📋 Viral reel keywords detected");
        
        const viralReelWorkflow = generateViralReelWorkflow(goal);
        
        console.log("📦 Nodes to execute:", viralReelWorkflow.steps.map(s => s.id));
        
        const enrichedResult = enrichWorkflow(viralReelWorkflow);
        
        console.log("🎯 FINAL WORKFLOW OUTPUT:", {
          workflowName: enrichedResult.workflowName,
          steps: enrichedResult.steps.length,
          agents: enrichedResult.agents.length
        });
        
        return NextResponse.json(
          {
            success: true,
            workflow: enrichedResult,
            metadata: {
              generatedAt: new Date().toISOString(),
              model: "viral-reel-specialized",
              workflowType: "viral-reel",
              validation: { isValid: true, errors: [], warnings: [] },
            },
          },
          { status: 200 }
        );
      }

      console.log("\n🎬 WORKFLOW STARTED - Reel Script Generator");
      console.log("🧾 Full Input Data:", { goal, options });
      console.log("📋 Reel/Video keywords detected");
      
      const reelWorkflow = generateReelScriptWorkflow(goal);
      
      console.log("📦 Nodes to execute:", reelWorkflow.steps.map(s => s.id));
      
      const enrichedResult = enrichWorkflow(reelWorkflow);
      
      console.log("🎯 FINAL WORKFLOW OUTPUT:", {
        workflowName: enrichedResult.workflowName,
        steps: enrichedResult.steps.length,
        agents: enrichedResult.agents.length
      });
      
      return NextResponse.json(
        {
          success: true,
          workflow: enrichedResult,
          metadata: {
            generatedAt: new Date().toISOString(),
            model: "reel-script-specialized",
            workflowType: "reel-script",
            validation: { isValid: true, errors: [], warnings: [] },
          },
        },
        { status: 200 }
      );
    }

    if (isSocialMediaPrompt(goal)) {
      console.log("\n📱 WORKFLOW STARTED - Social Media Post");
      console.log("🧾 Full Input Data:", { goal, options });
      console.log("📋 Social media keywords detected");
      
      const socialMediaWorkflow = generateSocialMediaPostWorkflow(goal);
      
      console.log("📦 Nodes to execute:", socialMediaWorkflow.steps.map(s => s.id));
      
      const enrichedResult = enrichWorkflow(socialMediaWorkflow);
      
      console.log("🎯 FINAL WORKFLOW OUTPUT:", {
        workflowName: enrichedResult.workflowName,
        steps: enrichedResult.steps.length,
        agents: enrichedResult.agents.length
      });
      
      return NextResponse.json(
        {
          success: true,
          workflow: enrichedResult,
          metadata: {
            generatedAt: new Date().toISOString(),
            model: "social-media-specialized",
            workflowType: "social-media-post",
            validation: { isValid: true, errors: [], warnings: [] },
          },
        },
        { status: 200 }
      );
    }

    if (isImageGenerationPrompt(goal)) {
      console.log("\n🖼️ WORKFLOW STARTED - Image Generation");
      console.log("🧾 Full Input Data:", { goal, options });
      console.log("📋 Image generation keywords detected");
      
      const imageWorkflow = generateImageGenerationWorkflow(goal);
      
      console.log("📦 Nodes to execute:", imageWorkflow.steps.map(s => s.id));
      
      const enrichedResult = enrichWorkflow(imageWorkflow);
      
      console.log("🎯 FINAL WORKFLOW OUTPUT:", {
        workflowName: enrichedResult.workflowName,
        steps: enrichedResult.steps.length,
        agents: enrichedResult.agents.length
      });
      
      return NextResponse.json(
        {
          success: true,
          workflow: enrichedResult,
          metadata: {
            generatedAt: new Date().toISOString(),
            model: "image-generation-specialized",
            workflowType: "image-generation",
            validation: { isValid: true, errors: [], warnings: [] },
          },
        },
        { status: 200 }
      );
    }

    const contextPrompt = options?.context
      ? `\n\nADDITIONAL CONTEXT:\n${options.context}`
      : "";

    let complexityPrompt = "";
    if (options?.complexity && options.complexity !== "auto") {
      complexityPrompt = `\n\nComplexity preference: ${options.complexity}`;
    }

    const maxStepsPrompt =
      options?.maxSteps
        ? `\n\nMaximum number of steps: ${options.maxSteps}`
        : "";

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: WORKFLOW_GENERATION_PROMPT,
        },
        {
          role: "user",
          content: `Generate a workflow for this goal:${contextPrompt}${complexityPrompt}${maxStepsPrompt}\n\nGOAL: ${goal}`,
        },
      ],
    });

    const rawResponse = completion.choices[0]?.message?.content ?? "";

    const workflow = extractJSON(rawResponse);

    if (!workflow) {
      console.error("Failed to extract JSON from LLM response:", rawResponse);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate workflow",
          details: "Invalid JSON response from LLM",
          raw: rawResponse.substring(0, 500),
        },
        { status: 500 }
      );
    }

    const validationResult = validateWorkflow(workflow);

    if (!validationResult.isValid) {
      console.error("Workflow validation failed:", validationResult.errors);

      return NextResponse.json(
        {
          success: false,
          error: "Generated workflow validation failed",
          details: validationResult.errors,
          warnings: validationResult.warnings,
          raw: rawResponse.substring(0, 500),
        },
        { status: 500 }
      );
    }

    const enhancedWorkflow = enhanceWorkflow(workflow, options);
    const enrichedResult = enrichWorkflow(enhancedWorkflow);

    const finalValidation = validateWorkflow(enrichedResult);

    return NextResponse.json(
      {
        success: true,
        workflow: enrichedResult,
        metadata: {
          generatedAt: new Date().toISOString(),
          model: "llama-3.3-70b-versatile",
          validation: finalValidation,
          warnings: finalValidation.warnings,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Auto Workflow Generation Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate workflow",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json(
    {
      endpoint: "/api/auto-workflow",
      method: "POST",
      description:
        "Generate a structured workflow JSON based on a user goal",
      version: "1.0.0",
      capabilities: [
        "Generate multi-agent workflows",
        "Support for Planner, Researcher, Executor, Reviewer agents",
        "Conditional logic and loops",
        "API integration support",
        "Human approval checkpoints",
        "Workflow validation and enrichment",
      ],
      requestBody: {
        goal: {
          type: "string",
          required: true,
          description: "The user's goal or task description",
          example: "Research and summarize the latest AI news",
        },
        options: {
          type: "object",
          required: false,
          properties: {
            context: {
              type: "string",
              description: "Additional context for workflow generation",
              example: "Focus on technology and machine learning",
            },
            complexity: {
              type: "string",
              enum: ["low", "medium", "high", "auto"],
              description: "Desired workflow complexity level",
              default: "auto",
            },
            maxSteps: {
              type: "number",
              description: "Maximum number of workflow steps",
              example: 10,
            },
            preferredTools: {
              type: "array",
              items: { type: "string" },
              description: "List of preferred tool names to use",
            },
          },
        },
      },
      response: {
        success: true,
        workflow: {
          workflowName: "string",
          description: "string",
          goal: "string",
          steps: "array of step objects",
          agents: "array of agent definitions",
          tools: "array of tool configurations",
          dependencies: "object mapping step dependencies",
          estimatedComplexity: "low | medium | high",
          estimatedSteps: "number",
        },
        metadata: {
          generatedAt: "ISO timestamp",
          model: "model used",
          validation: {
            isValid: "boolean",
            errors: [],
            warnings: [],
          },
        },
      },
      example: {
        request: {
          goal: "Research and summarize the latest AI news",
          options: {
            complexity: "medium",
          },
        },
        response: {
          success: true,
          workflow: {
            workflowName: "AI News Research Workflow",
            description: "Automated workflow to research and summarize AI news",
            goal: "Research and summarize the latest AI news",
            steps: [],
            agents: [],
            tools: [],
            dependencies: {},
            estimatedComplexity: "medium",
            estimatedSteps: 5,
          },
          metadata: {
            generatedAt: "2026-03-24T10:00:00.000Z",
            model: "llama-3.3-70b-versatile",
            validation: {
              isValid: true,
              errors: [],
              warnings: [],
            },
          },
        },
      },
    },
    { status: 200 }
  );
}
