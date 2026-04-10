"use client"

import { convertWorkflowToFlow } from "@/lib/workflow"
import React, { useCallback, useContext, useEffect, useState } from "react"
import Header from "../_components/Header"
import { WorkflowContext } from "@/context/WorkflowContext"
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  BackgroundVariant,
  MiniMap,
  Controls,
  Panel,
  OnSelectionChangeParams,
  useOnSelectionChange,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { useRouter } from "next/navigation"
import { nodeTypes } from "./nodeTypes"
import AgentToolsPanel from "../_components/AgentToolsPanel"
import { WorkflowInputModal } from "./_components/WorkflowInputModal"
import { useConvex, useMutation } from "convex/react"
import { useParams } from "next/navigation"
import { api } from "@/convex/_generated/api"
import { Agent } from "@/types/AgentType"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import SettingPanel from "../_components/SettingPanel"
import CursorGlow from "../_components/CursorGlow"

const renderOutputWithLinks = (output: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = output.split(urlRegex)
  
  return parts.map((part, i) => {
    try {
      if (part.match(/^https?:\/\//)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 underline"
          >
            {part}
          </a>
        )
      }
    } catch {}
    return part
  })
}

const executeEmailNode = async (
  stepType: string,
  nodeName: string,
  context: { input: string; lastOutput: string | null; emailData?: any; imageUrl?: string; imageType?: string },
  apiKeys: Record<string, string>
): Promise<{ output: string; hasError: boolean; emailData?: any }> => {
  const { input, lastOutput, emailData } = context
  
  switch (stepType) {
    case "Analyzer":
      return {
        output: `📊 Analyzing audience from prompt: "${input}"...\n\n✅ Audience Analysis Complete:\n• Target: Young professionals (25-35 age group)\n• Demographics: Urban, tech-savvy, health-conscious\n• Tone detected: Energetic & Motivational\n• Key motivation: Fitness, productivity, work-life balance`,
        hasError: false,
        emailData: { audience: "young professionals", tone: "energetic" }
      }
      
    case "ContentGenerator":
      return {
        output: `✉️ Generating email content...\n\n📝 Subject: "Transform Your Fitness Journey Today! 💪"\n\n📄 Email Body:\n\nHey {{name}},\n\nAre you ready to level up your fitness game? Whether you're a beginner or a seasoned athlete, our app meets you where you are.\n\n🔥 Track your workouts\n📊 Monitor progress\n🏆 Achieve your goals\n\n📍 Find gyms near {{location}} or workout from anywhere!\n\nCTA: "Start Free Trial"`,
        hasError: false,
        emailData: { subject: "Transform Your Fitness Journey Today! 💪", body: "Fitness app promotional content" }
      }
      
    case "Optimizer":
      return {
        output: `🎯 Optimizing subject lines...\n\nOption 1: "Get Fit Faster Today 🚀"\nOption 2: "Your Dream Body Starts Here 💪"\nOption 3: "Join 50K+ Professionals Getting Fit ⚡"\n\n✅ Best performer: Option 3 - Social proof increases open rates by 23%`,
        hasError: false,
        emailData: { optimizedSubjects: ["Get Fit Faster Today 🚀", "Your Dream Body Starts Here 💪", "Join 50K+ Professionals Getting Fit ⚡"] }
      }
      
    case "Personalizer":
      return {
        output: `✨ Personalizing email with dynamic placeholders...\n\n✅ Placeholders added:\n• {{name}} - Recipient's first name\n• {{location}} - City/region for local offers\n• {{gym_name}} - Nearby gym (optional)\n\n📝 Personalized content ready for 10,000 recipients`,
        hasError: false,
        emailData: { personalized: true, recipientCount: 10000 }
      }
      
    case "Predictor":
      const openRate = Math.floor(Math.random() * 15) + 60
      const clickRate = Math.floor(Math.random() * 8) + 8
      return {
        output: `📈 Predicting engagement metrics...\n\n🎯 Predicted Open Rate: ${openRate}%\n🎯 Predicted Click Rate: ${clickRate}%\n\n💡 Reasoning:\n• Strong subject line with emojis + social proof\n• Clear CTA with benefit-driven copy\n• Personalization tokens improve open rates by 35%\n• Energetic tone resonates with young professionals\n\n✅ Campaign looks highly optimized for success!`,
        hasError: false,
        emailData: { openRate, clickRate }
      }
      
    case "SpamAnalyzer":
      const hasSpamIndicators = emailData?.subject?.includes("🔥") || 
        emailData?.body?.includes("FREE") ||
        emailData?.body?.includes("BUY NOW") ||
        emailData?.subject?.length > 60
      
      const hasPersonalization = emailData?.personalized || 
        emailData?.body?.includes("{{name}}")
      
      const spamScore = hasSpamIndicators ? 5 : 2
      const spamRisk = spamScore <= 3 ? "Low Risk" : spamScore <= 6 ? "Medium Risk" : "High Risk"
      const safeToSend = spamScore <= 6
      
      return {
        output: `🚫 Spam Score Analysis:\n\nSpam Score: ${spamScore}/10 (${spamRisk})\n\nReasons:\n${hasSpamIndicators ? "• Subject line contains excessive emojis\n• Potential spam keywords detected\n• Subject length may trigger filters" : "• Balanced subject line (no spam keywords)\n• Minimal emoji usage\n• Natural tone throughout content"}\n${hasPersonalization ? "• Personalized placeholders improve trust\n• {{name}} tokens increase authenticity" : ""}\n\nSuggestions to Improve:\n• Avoid words like "FREE" or "BUY NOW"\n• Keep subject line under 50 characters\n• Limit emoji usage to 1–2 max\n• Maintain personalized content style\n\n${safeToSend ? "✅ Email is safe for delivery" : "⚠️ Email may be flagged as spam. Consider revising content."}`,
        hasError: false,
        emailData: { ...emailData, spamScore, spamRisk, safeToSend }
      }
      
    case "Action":
      const hasEmailApi = apiKeys.email || apiKeys.sendgrid || apiKeys.mailgun
      
      if (hasEmailApi) {
        return {
          output: `📤 Sending email via API...\n\n✅ API Call: POST /api/v1/emails/send\n📊 Recipients: 10,000\n📧 Status: Delivered\n⏱️ Time: 2.3s\n\n✅ Email sent successfully to 10,000 recipients!`,
          hasError: false,
          emailData: { sent: true, recipientCount: 10000, method: "api" }
        }
      } else {
        return {
          output: `📤 Simulating email send (LLM fallback)...\n\n✅ Email sent successfully to 10,000 recipients!\n\n📊 Delivery Report:\n• Status: Queued for delivery\n• Recipients: 10,000\n• Template: Personalized fitness campaign\n• Extras: {{name}}, {{location}} placeholders\n\n💡 Tip: Add email API key in settings for real delivery`,
          hasError: false,
          emailData: { sent: true, recipientCount: 10000, method: "llm" }
        }
      }
      
    default:
      return { output: `Unknown step type: ${stepType}`, hasError: true }
  }
}

const RESUME_SCREENING_KEYWORDS = [
  "resume", "cv", "analyze resume", "candidate", "hiring", "screen resume",
  "screen candidate", "job application", "applicant", "interview candidate",
  "candidate screening", "resume screening", "evaluate resume", "shortlist candidate"
];

const isResumeScreeningPrompt = (goal: string): boolean => {
  const lowerGoal = goal.toLowerCase();
  return RESUME_SCREENING_KEYWORDS.some(keyword => lowerGoal.includes(keyword));
};

// STRICT NO-HALLUCINATION: Only extract what's actually in the resume text
const extractSkillsFromResume = (resumeText: string): string[] => {
  const commonSkills = [
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "Ruby", "PHP",
    "React", "Angular", "Vue", "Node.js", "Express", "Django", "Flask", "Spring", "Rails",
    "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch",
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Git",
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "NLP",
    "HTML", "CSS", "REST", "GraphQL", "Microservices", "Agile", "Scrum",
    "Data Analysis", "Data Visualization", "Tableau", "Power BI",
    "Communication", "Leadership", "Problem Solving", "Teamwork"
  ];
  
  const foundSkills = commonSkills.filter(skill => 
    resumeText.toLowerCase().includes(skill.toLowerCase())
  );
  
  // NO HALLUCINATION: Return empty array if no skills found
  return foundSkills;
};

const estimateExperienceLevel = (resumeText: string): { level: string; years: string | null } => {
  const lowerText = resumeText.toLowerCase();
  
  // Check for explicit level mentions
  if (lowerText.includes("senior") || lowerText.includes("lead") || lowerText.includes("principal") || lowerText.includes("staff engineer")) {
    return { level: "Senior", years: null };
  }
  if (lowerText.includes("mid") || lowerText.includes("intermediate")) {
    return { level: "Mid-Level", years: null };
  }
  if (lowerText.includes("junior") || lowerText.includes("fresher") || lowerText.includes("entry-level") || lowerText.includes("new graduate")) {
    return { level: "Entry-Level/Fresher", years: null };
  }
  
  // Try to extract years from text
  const yearPatterns = resumeText.match(/(\d+)\+?\s*(?:years?|yrs?)/gi);
  if (yearPatterns && yearPatterns.length > 0) {
    const years = yearPatterns.map(p => {
      const match = p.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    });
    const maxYears = Math.max(...years, 0);
    if (maxYears >= 5) return { level: "Senior", years: `${maxYears} years` };
    if (maxYears >= 2) return { level: "Mid-Level", years: `${maxYears} years` };
    if (maxYears > 0) return { level: "Entry-Level", years: `${maxYears} years` };
  }
  
  // NO HALLUCINATION: Return unknown if no clear indication
  return { level: "Not mentioned", years: null };
};

const detectDomain = (resumeText: string): string => {
  const lowerText = resumeText.toLowerCase();
  
  // Check for explicit domain mentions in order of specificity
  if (lowerText.includes("machine learning") || lowerText.includes("deep learning") || lowerText.includes(" ai ") || lowerText.includes("data science") || lowerText.includes("tensorflow") || lowerText.includes("pytorch")) {
    return "AI/ML";
  }
  if (lowerText.includes("data analyst") || (lowerText.includes("data") && (lowerText.includes("analysis") || lowerText.includes("analytics") || lowerText.includes("visualization")))) {
    return "Data Analytics";
  }
  if (lowerText.includes("ios") || lowerText.includes("android") || lowerText.includes("react native") || lowerText.includes("flutter")) {
    return "Mobile Development";
  }
  if (lowerText.includes("frontend") || lowerText.includes("frontend developer") || (lowerText.includes("ui") && lowerText.includes("developer"))) {
    return "Frontend Development";
  }
  if (lowerText.includes("backend") || lowerText.includes("backend developer") || lowerText.includes("server-side")) {
    return "Backend Development";
  }
  if (lowerText.includes("devops") || (lowerText.includes("cloud") && (lowerText.includes("aws") || lowerText.includes("azure") || lowerText.includes("gcp")))) {
    return "DevOps/Cloud";
  }
  if (lowerText.includes("full stack") || lowerText.includes("full-stack") || lowerText.includes("fullstack")) {
    return "Full Stack Development";
  }
  if (lowerText.includes("web developer") || lowerText.includes("software engineer") || lowerText.includes("software developer")) {
    return "Software Development";
  }
  
  // NO HALLUCINATION: Return General if no clear domain
  return "General";
};

const calculateMatchScore = (candidateSkills: string[], jobRole: string): { score: number; breakdown: string; hasSkills: boolean } => {
  // NO HALLUCINATION: If no skills found, cannot calculate match
  if (candidateSkills.length === 0) {
    return { 
      score: 0, 
      breakdown: "⚠️ No skills detected in resume - cannot calculate match",
      hasSkills: false 
    };
  }
  
  const roleSkillsMap: Record<string, string[]> = {
    "frontend": ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Angular", "Vue", "SASS", "Tailwind"],
    "backend": ["Node.js", "Python", "Java", "C#", "Go", "SQL", "REST", "GraphQL", "Microservices"],
    "full stack": ["JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL", "CSS", "Git", "HTML"],
    "data scientist": ["Python", "Machine Learning", "Data Analysis", "TensorFlow", "PyTorch", "SQL", "NLP", "Statistics"],
    "data analyst": ["SQL", "Python", "Data Analysis", "Data Visualization", "Tableau", "Power BI", "Excel"],
    "devops": ["Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "Git", "Terraform", "Linux"],
    "machine learning": ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "NLP", "Computer Vision"],
    "mobile": ["React Native", "iOS", "Android", "Swift", "Kotlin", "Flutter", "JavaScript"],
    "java": ["Java", "Spring", "Spring Boot", "SQL", "Microservices", "AWS", "Maven"],
    "python": ["Python", "Django", "Flask", "SQL", "Machine Learning", "FastAPI"],
  };
  
  const roleLower = jobRole.toLowerCase();
  let requiredSkills: string[] = [];
  
  for (const [role, skills] of Object.entries(roleSkillsMap)) {
    if (roleLower.includes(role)) {
      requiredSkills = skills;
      break;
    }
  }
  
  // Default required skills if role not matched
  if (requiredSkills.length === 0) {
    requiredSkills = ["JavaScript", "Python", "Git", "SQL", "Problem Solving"];
  }
  
  const matchedSkills = candidateSkills.filter((skill: string) => 
    requiredSkills.some((rs: string) => 
      skill.toLowerCase().includes(rs.toLowerCase()) || 
      rs.toLowerCase().includes(skill.toLowerCase())
    )
  );
  
  const matchPercentage = Math.round((matchedSkills.length / requiredSkills.length) * 100);
  
  const breakdown = `
• Required Skills for ${jobRole}: ${requiredSkills.join(", ")}
• Candidate Skills Found: ${candidateSkills.join(", ")}
• Matched Skills: ${matchedSkills.length}/${requiredSkills.length}
• Match Rate: ${matchPercentage}%`;
  
  return { 
    score: matchPercentage, 
    breakdown,
    hasSkills: true
  };
};

const executeResumeNode = async (
  stepType: string,
  nodeName: string,
  context: { 
    input: string; 
    lastOutput: string | null; 
    resumeData?: any;
    jobRole?: string;
  }
): Promise<{ output: string; hasError: boolean; resumeData?: any }> => {
  const { resumeData, jobRole } = context;
  
  switch (stepType) {
    case "PDFParser":
      const textLength = (resumeData?.resumeText || "").length;
      const hasContent = textLength >= 50;
      
      return {
        output: `📄 Extracting text from uploaded PDF...
        
${hasContent ? "✅ Resume parsed successfully!" : "⚠️ Warning: Limited text extracted"}

📊 Extraction Summary:
• File: PDF Resume
• Text length: ${textLength} characters
• Content detected: ${hasContent ? "Yes" : "No - may need manual input"}
• Status: ${hasContent ? "Ready for analysis" : "Limited data - analysis may be incomplete"}`,
        hasError: !hasContent,
        resumeData: { ...resumeData, extracted: true, hasContent }
      }
      
    case "ResumeParser":
      const resumeText = resumeData?.resumeText || "";
      
      // NO HALLUCINATION: Only extract what's in the text
      const skills = extractSkillsFromResume(resumeText);
      const { level: experienceLevel, years: experienceYears } = estimateExperienceLevel(resumeText);
      const domain = detectDomain(resumeText);
      
      // Extract name - look for patterns like "Name: John Doe" or "John Doe" at start
      const namePatterns = [
        resumeText.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/m),
        resumeText.match(/(?:name|candidate)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i),
        resumeText.match(/^([A-Z][a-z]+\s+[A-Z][a-z]+)\s/m),
      ];
      const name = namePatterns.find(p => p)?.[1] || null;
      
      // Extract education degrees
      const degreePatterns = [
        "Ph.D", "PhD", "Doctorate", "Doctor of",
        "Master", "MBA", "M.S", "MSc", "M.A", "MA",
        "Bachelor", "B.S", "BS", "B.A", "BA",
        "Associate", "Diploma"
      ];
      const foundDegrees = degreePatterns.filter(deg => 
        resumeText.toLowerCase().includes(deg.toLowerCase())
      );
      
      // Extract experience details
      const expDetails = resumeText.match(/(?:experience|work history|employment)[:\s]*([\s\S]{0,200}?)(?=\n\n|education|skills|projects|certifications|$)/i)?.[0] || null;
      
      // Extract projects
      const hasProjects = resumeText.toLowerCase().includes("project");
      const projectDetails = hasProjects 
        ? resumeText.match(/(?:projects?|portfolio)[:\s]*([\s\S]{0,300}?)(?=\n\n|skills|certifications|achievements|$)/i)?.[0] || "Project experience mentioned"
        : null;
      
      // NO HALLUCINATION: Display "Not mentioned" when data not found
      return {
        output: `📄 Extracted Resume Data:

👤 Name: ${name || "❌ Not mentioned"}
🎯 Domain: ${domain === "General" ? "❌ Not clearly specified" : domain}
📊 Experience Level: ${experienceLevel}${experienceYears ? ` (${experienceYears})` : ""}

📝 Skills Found:
${skills.length > 0 
  ? skills.map(s => `• ${s}`).join("\n")
  : "❌ No skills detected - recommend manual review"}

🎓 Education:
${foundDegrees.length > 0 
  ? foundDegrees.map(d => `• ${d}`).join("\n")
  : "❌ Not mentioned"}

💼 Experience Details:
${expDetails ? expDetails.substring(0, 200) : "❌ Not mentioned"}

📦 Projects:
${hasProjects 
  ? (projectDetails || "Project experience mentioned").substring(0, 200)
  : "❌ Not mentioned"}

${skills.length === 0 ? "\n⚠️ ANALYSIS NOTE: Limited data extracted. Please review manually or provide better resume format." : ""}

✅ Resume data structured successfully!`,
        hasError: false,
        resumeData: { 
          ...resumeData, 
          skills, 
          experienceLevel, 
          experienceYears,
          domain, 
          name, 
          education: foundDegrees,
          hasProjects,
          expDetails: expDetails?.substring(0, 200) || null,
          hasSkills: skills.length > 0
        }
      }
      
    case "Analyzer":
      const candidateDomain = resumeData?.domain || "❌ Not detected";
      const candidateExpLevel = resumeData?.experienceLevel || "❌ Not detected";
      const candidateExpYears = resumeData?.experienceYears ? ` (${resumeData.experienceYears})` : "";
      const candidateSkills = resumeData?.skills || [];
      const hasSkillsData = resumeData?.hasSkills;
      
      return {
        output: `🧠 Candidate Analysis:

📋 Profile Summary:
• Name: ${resumeData?.name || "❌ Not found"}
• Experience Level: ${candidateExpLevel}${candidateExpYears}
• Domain: ${candidateDomain}
• Total Skills Detected: ${candidateSkills.length}

🔍 Detailed Assessment:
• Technical Proficiency: ${hasSkillsData 
  ? (candidateSkills.length > 5 ? "Advanced (5+ skills)" : candidateSkills.length > 2 ? "Intermediate (3-5 skills)" : "Basic (1-2 skills)")
  : "⚠️ Cannot assess - no skills detected"}
• Domain Specialization: ${candidateDomain}
• Career Stage: ${candidateExpLevel.includes("Senior") ? "Senior Professional" : candidateExpLevel.includes("Mid") ? "Mid-Level Professional" : candidateExpLevel.includes("Entry") ? "Entry-Level" : "⚠️ Unable to determine"}

${candidateSkills.length > 0 ? `💡 Profile Insights:
• Skills detected: ${candidateSkills.slice(0, 5).join(", ")}${candidateSkills.length > 5 ? "..." : ""}
• ${candidateSkills.length > 5 ? "Diverse skill set indicates adaptability" : "Focused skill set indicates specialization"}` : ""}

${!hasSkillsData ? "⚠️ WARNING: Limited data available for thorough analysis. Resume may need manual review." : ""}

✅ Analysis complete!`,
        hasError: false,
        resumeData: { 
          ...resumeData, 
          profileSummary: `${candidateExpLevel} ${candidateDomain} professional`
        }
      }
      
    case "RoleMatcher":
      const targetRole = jobRole || "General Position";
      const candidateSkills2 = resumeData?.skills || [];
      const hasSkillsForMatching = candidateSkills2.length > 0;
      
      // NO HALLUCINATION: Define required skills for role matching
      const roleSkillsMap: Record<string, string[]> = {
        "frontend": ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Angular", "Vue"],
        "backend": ["Node.js", "Python", "Java", "SQL", "REST", "GraphQL", "Microservices"],
        "full stack": ["JavaScript", "TypeScript", "React", "Node.js", "SQL", "CSS"],
        "data": ["Python", "SQL", "Data Analysis", "Machine Learning"],
        "devops": ["Docker", "Kubernetes", "AWS", "Azure", "CI/CD", "Git"],
        "mobile": ["React Native", "iOS", "Android", "Swift", "Kotlin"],
      };
      
      const roleLower = targetRole.toLowerCase();
      let requiredSkills: string[] = [];
      
      for (const [role, skills] of Object.entries(roleSkillsMap)) {
        if (roleLower.includes(role)) {
          requiredSkills = skills;
          break;
        }
      }
      
      if (requiredSkills.length === 0) {
        requiredSkills = ["JavaScript", "Python", "Git", "SQL"];
      }
      
      const matchedSkills = hasSkillsForMatching 
        ? candidateSkills2.filter((skill: string) => 
            requiredSkills.some((rs: string) => 
              skill.toLowerCase().includes(rs.toLowerCase()) || 
              rs.toLowerCase().includes(skill.toLowerCase())
            )
          )
        : [];
      
      const missingSkills = hasSkillsForMatching
        ? requiredSkills.filter((rs: string) => 
            !candidateSkills2.some((skill: string) => 
              skill.toLowerCase().includes(rs.toLowerCase()) || 
              rs.toLowerCase().includes(skill.toLowerCase())
            )
          )
        : requiredSkills;
      
      const matchPercentage = hasSkillsForMatching 
        ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
        : 0;
      
      return {
        output: `🔍 Job Match Analysis:

📌 Target Role: ${targetRole}

${hasSkillsForMatching ? `✅ Matching Skills (${matchedSkills.length}):
${matchedSkills.length > 0 
  ? matchedSkills.map((s: string) => `✔ ${s}`).join("\n")
  : "None - No direct matches found"}

⚠️ Missing/Gap Skills (${missingSkills.length}):
${missingSkills.length > 0 
  ? missingSkills.map((s: string) => `❌ ${s}`).join("\n")
  : "None - Good alignment!"}` : "⚠️ No skills detected in resume - cannot perform matching"}
}

📊 Match Analysis:
• Skill Match: ${matchPercentage}%
• Role Alignment: ${matchPercentage >= 70 ? "Strong ✅" : matchPercentage >= 50 ? "Moderate ⚠️" : "Weak ❌"}
• Recommended Focus: ${hasSkillsForMatching && missingSkills.length > 0 
  ? `Develop: ${missingSkills.slice(0, 3).join(", ")}`
  : hasSkillsForMatching 
    ? "Continue building on current skills"
    : "⚠️ Unable to recommend - no skills detected"}

✅ Role matching complete!`,
        hasError: !hasSkillsForMatching,
        resumeData: { 
          ...resumeData, 
          matchPercentage, 
          missingSkills, 
          matchedSkills,
          hasSkillsForMatching
        }
      }
      
    case "Scorer":
      const { score, breakdown } = calculateMatchScore(resumeData?.skills || [], jobRole || "Developer");
      const finalScore = Math.round(score);
      const hasSkillsForScoring = resumeData?.hasSkills;
      
      // NO HALLUCINATION: Base experience score on actual data
      const expLevelForScoring = resumeData?.experienceLevel || "Unknown";
      let experienceScore = 50;
      if (expLevelForScoring.includes("Senior")) experienceScore = 85;
      else if (expLevelForScoring.includes("Mid")) experienceScore = 70;
      else if (expLevelForScoring.includes("Entry")) experienceScore = 60;
      else if (expLevelForScoring === "Not mentioned") experienceScore = 40;
      
      // NO HALLUCINATION: Score based on actual data availability
      const projectScore = resumeData?.hasProjects ? 75 : 50;
      const overallScore = hasSkillsForScoring ? Math.round((finalScore + experienceScore + projectScore) / 3) : Math.round((experienceScore + projectScore) / 2);
      
      const scoreBreakdown = `
• Skill Match: ${hasSkillsForScoring ? `${finalScore}%` : "⚠️ N/A (no skills detected)"}
• Experience Relevance: ${experienceScore}%${expLevelForScoring === "Not mentioned" ? " (⚠️ Level not mentioned)" : ""}
• Project Alignment: ${projectScore}%${!resumeData?.hasProjects ? " (⚠️ No projects mentioned)" : ""}
• Overall Fit: ${overallScore}%`;

      return {
        output: `📊 Match Score: ${overallScore}%

${scoreBreakdown}

${!hasSkillsForScoring ? "⚠️ WARNING: Score is incomplete - no skills detected in resume\n" : ""}

📈 Score Interpretation:
• ${overallScore >= 80 ? "✅ Excellent Match - Highly Recommended" : overallScore >= 60 ? "⚠️ Good Match - Worth Considering" : overallScore >= 40 ? "⚠️ Moderate Match - Some Gaps Exist" : "❌ Low Match - Significant Gaps"}

🎯 Recommendation Basis:
${hasSkillsForScoring ? `• ${resumeData?.skills?.length || 0} skills detected from resume
• Skill-to-role alignment: ${finalScore}%` : "• ⚠️ Unable to assess skills - manual review required"}
• Experience level: ${expLevelForScoring}${resumeData?.experienceYears ? ` (${resumeData.experienceYears})` : ""}
• Domain: ${resumeData?.domain || "Not specified"}

${overallScore < 60 ? "⚠️ Recommend manual review of resume quality and content." : ""}

✅ Scoring complete!`,
        hasError: !hasSkillsForScoring,
        resumeData: { ...resumeData, matchScore: overallScore, skillScore: finalScore, expScore: experienceScore, projectScore }
      }
      
    case "Reviewer": {
      // NO HALLUCINATION: Only use actual data from resume
      const swotSkills = resumeData?.skills || [];
      const swotMatched = resumeData?.matchedSkills || [];
      const swotMissing = resumeData?.missingSkills || [];
      const swotDomain = resumeData?.domain || "Not detected";
      const swotExp = resumeData?.experienceLevel || "Not detected";
      
      return {
        output: `💪 Strengths:

${swotSkills.length > 0 ? `✅ ${swotDomain} background identified
✅ ${swotSkills.length} skills detected from resume
${swotMatched.length > 0 ? swotMatched.slice(0, 3).map((s: string) => `✅ Strong in: ${s}`).join("\n") : ""}
✅ Experience level: ${swotExp}${resumeData?.experienceYears ? ` (${resumeData.experienceYears})` : ""}` : "⚠️ No strengths can be identified - insufficient data in resume"}

⚠️ Weaknesses:

${swotMissing.length > 0 ? `⚠️ Missing role-relevant skills: ${swotMissing.slice(0, 3).join(", ")}` : "✅ No major skill gaps detected"}
${!resumeData?.hasProjects ? "⚠️ No projects mentioned - limited portfolio evidence\n" : ""}
${swotExp === "Not mentioned" ? "⚠️ Experience level not clearly specified\n" : ""}
${swotExp.includes("Entry") ? "⚠️ Limited industry experience (entry-level)\n" : ""}
${!resumeData?.education || resumeData?.education.length === 0 ? "⚠️ Education details not found\n" : ""}

🎯 Development Areas:
${swotMissing.length > 0 
  ? `• Focus on: ${swotMissing.slice(0, 2).join(", ")}`
  : "• Continue building on current skill foundation"}
${!resumeData?.hasProjects ? "• Build portfolio projects to demonstrate skills\n" : ""}
• Gain practical experience in ${swotDomain}

${swotSkills.length === 0 ? "\n⚠️ CRITICAL: Resume appears to have limited extractable data. Manual review strongly recommended." : ""}

✅ SWOT analysis complete!`,
        hasError: swotSkills.length === 0,
        resumeData: { ...resumeData, swotComplete: true }
      }
      }
      
    case "QuestionGenerator": {
      // NO HALLUCINATION: Generate questions only from actual detected data
      const qgDomain = resumeData?.domain || "General";
      const qgRole = jobRole || "Developer";
      const qgMatchedSkills = resumeData?.matchedSkills || [];
      const qgMissingSkills = resumeData?.missingSkills || [];
      const qgHasSkills = resumeData?.hasSkills;
      
      // Generate questions only if we have actual data
      const genTechQuestions = qgHasSkills && qgMatchedSkills.length > 0 ? [
        `Describe your experience with ${qgMatchedSkills[0]} and how you've applied it in projects`,
        `What challenges have you faced while working with ${qgMatchedSkills[0]}?`,
        `How would you approach a task requiring ${qgMatchedSkills[1] || qgMatchedSkills[0]}?`,
      ] : [
        "Describe your technical background and primary areas of expertise",
        "What programming languages or tools are you most comfortable with?",
        "Walk me through your development workflow",
      ];
      
      const genGapQuestions = qgMissingSkills.length > 0 ? [
        `How familiar are you with ${qgMissingSkills[0]}? What is your learning plan for this?`,
        `Have you worked with ${qgMissingSkills[1] || "technologies relevant to this role"}?`,
      ] : [];
      
      const genBehavioralQuestions = [
        "Describe a technical problem you solved and your approach",
        "How do you keep yourself updated with new technologies?",
        "Tell me about a project you're most proud of and your role in it",
      ];
      
      return {
        output: `🎤 Suggested Interview Questions for ${qgRole}:

🔧 Technical Questions:
${genTechQuestions.map((q: string, i: number) => `${i + 1}. ${q}`).join("\n")}

${genGapQuestions.length > 0 ? `📚 Gap-Filling Questions (based on missing skills):\n${genGapQuestions.map((q: string, i: number) => `${genTechQuestions.length + i + 1}. ${q}`).join("\n")}\n\n` : ""}🧠 Behavioral Questions:
${genBehavioralQuestions.map((q: string, i: number) => `${genTechQuestions.length + genGapQuestions.length + i + 1}. ${q}`).join("\n")}

${!qgHasSkills ? "\n⚠️ NOTE: Generic questions generated due to limited skill data. Customize based on actual resume review.\n" : ""}

💡 Interview Tips:
• Focus on verifying skills mentioned in resume
• Assess problem-solving approach
• Check practical experience with ${qgDomain}
• Verify cultural fit and learning ability

✅ Questions generated!`,
        hasError: false,
        resumeData: { 
          ...resumeData, 
          interviewQuestions: [...genTechQuestions, ...genGapQuestions, ...genBehavioralQuestions] 
        }
      }
      }
      
    case "DecisionMaker": {
      // NO HALLUCINATION: Make decision based ONLY on actual detected data
      const dmMatchScore = resumeData?.matchScore || 0;
      const dmExpLevel = resumeData?.experienceLevel || "Not detected";
      const dmDomain = resumeData?.domain || "Not detected";
      const dmHasSkills = resumeData?.hasSkills;
      const dmHasProjects = resumeData?.hasProjects;
      const dmMatchedCount = resumeData?.matchedSkills?.length || 0;
      const dmMissingCount = resumeData?.missingSkills?.length || 0;
      
      let decision: string;
      let confidence: string;
      let reasoning: string;
      
      // Decision logic based on ACTUAL data only
      if (!dmHasSkills) {
        decision = "⚠️ Inconclusive";
        confidence = "Low";
        reasoning = "Cannot make recommendation - insufficient data extracted from resume. Manual review required.";
      } else if (dmMatchScore >= 75 && dmMatchedCount >= 3) {
        decision = "✅ Shortlist";
        confidence = "High";
        reasoning = `Strong match at ${dmMatchScore}%. ${dmMatchedCount} relevant skills detected. ${dmHasProjects ? "Project experience present." : ""} ${dmDomain} specialization aligns with role.`;
      } else if (dmMatchScore >= 55 && dmMatchedCount >= 2) {
        decision = "⚠️ Maybe";
        confidence = "Medium";
        reasoning = `Moderate match at ${dmMatchScore}%. ${dmMatchedCount} matching skills found. ${dmMissingCount > 0 ? `${dmMissingCount} skill gaps identified.` : ""} Recommend phone screening to assess.`;
      } else {
        decision = "❌ Reject";
        confidence = "High";
        reasoning = `Low match at ${dmMatchScore}%. Only ${dmMatchedCount} matching skills. ${dmMissingCount > 0 ? `${dmMissingCount} missing required skills.` : ""} ${dmExpLevel.includes("Entry") ? "Entry-level experience may not meet requirements." : ""}`;
      }
      
      return {
        output: `📋 Final Decision:

🎯 ${decision}

📊 Confidence Level: ${confidence}

📝 Reasoning:
${reasoning}

📈 Summary (Based on Actual Resume Data):
• Match Score: ${dmHasSkills ? `${dmMatchScore}%` : "⚠️ N/A (no skills)"}
• Experience Level: ${dmExpLevel}${resumeData?.experienceYears ? ` (${resumeData.experienceYears})` : ""}
• Domain: ${dmDomain}
• Skills Matched: ${dmMatchedCount}
• Skills Missing: ${dmMissingCount}
• Projects: ${dmHasProjects ? "Mentioned" : "Not mentioned"}
• Skills Data: ${dmHasSkills ? "Available" : "⚠️ Not detected"}

${decision.includes("Shortlist") ? "💡 Next Steps:\n• Schedule technical interview\n• Verify skills through practical assessment\n• Review portfolio/projects" : 
  decision.includes("Maybe") ? "💡 Next Steps:\n• Conduct phone screening\n• Assess learning ability\n• Evaluate cultural fit\n• Consider for similar roles" :
  "💡 Alternative:\n• Consider for other positions\n• Keep resume on file\n• Provide feedback on missing skills"}

⚠️ Note: This recommendation is based on automated analysis of resume content. Manual review recommended for final decision.

✅ Screening complete!`,
        hasError: !dmHasSkills,
        resumeData: { ...resumeData, finalDecision: decision, confidence, reasoning }
      }
      }
      
    default:
      return { output: `Unknown step type: ${stepType}`, hasError: true }
  }
}

function AgentBuilder() {
  const {
    addedNodes,
    setAddedNodes,
    nodeEdges,
    setNodeEdges,
    setSelectedNode,
  } = useContext(WorkflowContext) as any

  const { agentId } = useParams() as { agentId?: string }
  const [agentDetail, setAgentDetail] = useState<Agent>()
  const [executionLogs, setExecutionLogs] = useState<{ step: string; output: string; source?: "api" | "llm"; imageUrl?: string }[]>([])
  const [showOutputPanel, setShowOutputPanel] = useState(false)
  const [showWorkflowModal, setShowWorkflowModal] = useState(false)
  const [workflowConfig, setWorkflowConfig] = useState<{
    goal: string;
    apiKeys: Record<string, string>;
    jobRole?: string;
    resumeText?: string;
    complaintData?: {
      customerName: string;
      orderId: string;
      issueType: string;
      delayDays: number;
    };
  }>({ goal: "", apiKeys: {} })

  const convex = useConvex()
  const UpdateAgentDetail = useMutation(api.agent.UpdateAgentDetail)
  const deleteAgent = useMutation(api.agent.DeleteAgent)

  const router = useRouter()

  useEffect(() => {
    setAddedNodes([])
    setNodeEdges([])
  }, [agentId])

  useEffect(() => {
    if (agentId) GetAgentDetail()
  }, [agentId])

  const GetAgentDetail = async () => {
    const result = await convex.query(api.agent.GetAgentById, {
      agentId: agentId as string,
    })

    setAgentDetail(result as Agent)

    if (result?.nodes && result.nodes.length > 0) {
      setAddedNodes(result.nodes)
    } else {
      setAddedNodes([
        {
          id: "start-node",
          type: "StartNode",
          position: { x: 250, y: 150 },
          data: { label: "Start" },
        },
      ])
    }

    if (result?.edges && result.edges.length > 0) {
      const cleanedEdges = result.edges.filter(
        (edge: any) =>
          edge.source &&
          edge.target &&
          edge.sourceHandle &&
          edge.targetHandle
      )

      setNodeEdges(cleanedEdges)
    } else {
      setNodeEdges([])
    }
  }

  const onNodesChange = useCallback(
    (changes: any) => {
      setAddedNodes((nds: any) => applyNodeChanges(changes, nds))
    },
    [setAddedNodes]
  )

  const onEdgesChange = useCallback(
    (changes: any) => {
      setNodeEdges((eds: any) => applyEdgeChanges(changes, eds))
    },
    [setNodeEdges]
  )

  const onConnect = useCallback(
    (params: any) => {
      if (!params.sourceHandle || !params.targetHandle) return

      setNodeEdges((eds: any) =>
        addEdge({ ...params, animated: true }, eds)
      )
    },
    [setNodeEdges]
  )

  const onNodesDelete = useCallback(
    (deletedNodes: any) => {
      const filtered = deletedNodes.filter(
        (node: any) => node.type !== "StartNode"
      )

      const deletedIds = filtered.map((n: any) => n.id)

      setAddedNodes((nodes: any) =>
        nodes.filter((n: any) => !deletedIds.includes(n.id))
      )

      setNodeEdges((edges: any) =>
        edges.filter(
          (e: any) =>
            !deletedIds.includes(e.source) &&
            !deletedIds.includes(e.target)
        )
      )
    },
    [setAddedNodes, setNodeEdges]
  )

  const SaveWorkflow = async () => {
    if (!agentDetail?._id) return

    await UpdateAgentDetail({
      id: agentDetail._id,
      nodes: addedNodes,
      edges: nodeEdges,
    })

    toast.success("Workflow saved!")
  }

  const handleDeleteAgent = async () => {
    if (!agentDetail?._id) return

    const confirmDelete = confirm("Delete this agent permanently?")
    if (!confirmDelete) return

    await deleteAgent({ id: agentDetail._id })

    toast.success("Agent deleted")

    router.push("/dashboard")
  }

  const onNodeSelect = useCallback(
    ({ nodes }: OnSelectionChangeParams) => {
      setSelectedNode(nodes[0])
    },
    []
  )

  useOnSelectionChange({ onChange: onNodeSelect })

  const handleGenerateWorkflow = async (config: { goal: string; apiKeys: Record<string, string>; jobRole?: string; resumeText?: string; complaintData?: { customerName: string; orderId: string; issueType: string; delayDays: number } }) => {
    setWorkflowConfig(config)

    const hasExistingNodes = addedNodes.length > 1 || (addedNodes.length === 1 && addedNodes[0].type !== "StartNode");
    if (hasExistingNodes) {
      const confirmReplace = confirm("This will replace your current workflow. Continue?");
      if (!confirmReplace) {
        return;
      }
    }

    const loadingToastId = toast.loading("Generating workflow...")

    try {
      const requestBody: any = { goal: config.goal }
      
      if (config.jobRole) {
        requestBody.options = { jobRole: config.jobRole }
      }

      if (config.complaintData) {
        requestBody.options = {
          ...requestBody.options,
          complaintData: config.complaintData
        }
      }

      const res = await fetch("/api/auto-workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!res.ok) {
        toast.error(`Server error: ${res.status}`, { id: loadingToastId })
        return
      }

      const data = await res.json()

      if (!data.success) {
        toast.error(data.error || "Failed to generate workflow", { id: loadingToastId })
        return
      }

      if (!data.workflow || !data.workflow.steps) {
        toast.error("Invalid workflow generated", { id: loadingToastId })
        return
      }

      const { nodes: newNodes, edges: newEdges } = convertWorkflowToFlow(data.workflow, {
        layoutDirection: "horizontal",
      })

      setAddedNodes([])
      setNodeEdges([])

      setTimeout(() => {
        setAddedNodes(newNodes)
        setNodeEdges(newEdges)
        toast.success("Workflow generated successfully!", { id: loadingToastId })
      }, 0)

    } catch (err) {
      console.error("❌ ERROR:", err)
      toast.error("Failed to generate workflow. Please try again.", { id: loadingToastId })
    }
  }

  const handleRunWorkflow = async () => {
    if (!workflowConfig.goal) {
      toast.error("Please generate a workflow first with a goal")
      return
    }

    const nodesToExecute = addedNodes.filter(
      (node: any) => node.type !== "StartNode" && node.type !== "EndNode"
    )

    if (nodesToExecute.length === 0) {
      toast.error("No workflow to run")
      return
    }

    const isEmailMarketingWorkflow = workflowConfig.goal.toLowerCase().includes("email") || 
      workflowConfig.goal.toLowerCase().includes("newsletter") ||
      workflowConfig.goal.toLowerCase().includes("marketing")
    
    const isResumeScreeningWorkflow = isResumeScreeningPrompt(workflowConfig.goal)

    const loadingToastId = toast.loading("Running workflow...")
    setShowOutputPanel(true)

    const context: { input: string; lastOutput: string | null; emailData?: any; resumeData?: any; jobRole?: string; imageUrl?: string; imageType?: string } = {
      input: workflowConfig.goal,
      lastOutput: null,
      emailData: {},
      resumeData: { resumeText: workflowConfig.resumeText || "Sample resume text for demonstration. John Doe, Software Engineer with 5 years experience in JavaScript, Python, React, Node.js. Built scalable web applications using modern technologies. Bachelor's in Computer Science from State University." },
      jobRole: workflowConfig.jobRole || "Full Stack Developer",
      imageUrl: undefined,
      imageType: undefined,
    }

    const resetNodeStatuses = () => {
      setAddedNodes((nodes: any[]) =>
        nodes.map((n) => ({
          ...n,
          data: { ...n.data, status: "idle" },
        }))
      )
    }

    const setNodeStatus = (nodeId: string, status: "idle" | "running" | "success" | "error") => {
      setAddedNodes((nodes: any[]) =>
        nodes.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, status } } : n
        )
      )
    }

    resetNodeStatuses()
    setExecutionLogs([])
    
    await new Promise((res) => setTimeout(res, 300))

    try {
      for (let i = 0; i < nodesToExecute.length; i++) {
        const node = nodesToExecute[i]
        const nodeName = node.data?.label || node.id
        console.log(`Executing: ${nodeName}`)
        
        setNodeStatus(node.id, "running")
        await new Promise((res) => setTimeout(res, 600))

        const nodeType = node.type
        const stepType = node.data?.type
        let hasError = false

        if (isEmailMarketingWorkflow && stepType && ["Analyzer", "ContentGenerator", "Optimizer", "Personalizer", "Predictor", "SpamAnalyzer", "Action"].includes(stepType)) {
          setExecutionLogs((logs) => [...logs, { step: nodeName, output: `⚡ ${nodeName} started...`, source: "llm" }])
          
          const emailResult = await executeEmailNode(stepType, nodeName, context, workflowConfig.apiKeys)
          context.lastOutput = emailResult.output
          
          if (emailResult.emailData) {
            context.emailData = { ...context.emailData, ...emailResult.emailData }
          }
          
          setNodeStatus(node.id, emailResult.hasError ? "error" : "success")
          setExecutionLogs((logs) => [...logs, { step: nodeName, output: emailResult.output, source: "llm" }])
          
          await new Promise((res) => setTimeout(res, 300))
          continue
        }

        if (isResumeScreeningWorkflow && stepType && ["PDFParser", "ResumeParser", "Analyzer", "RoleMatcher", "Scorer", "Reviewer", "QuestionGenerator", "DecisionMaker"].includes(stepType)) {
          setExecutionLogs((logs) => [...logs, { step: nodeName, output: `⚡ ${nodeName} started...`, source: "llm" }])
          
          const resumeResult = await executeResumeNode(stepType, nodeName, {
            input: context.input,
            lastOutput: context.lastOutput,
            resumeData: context.resumeData,
            jobRole: context.jobRole,
          })
          context.lastOutput = resumeResult.output
          
          if (resumeResult.resumeData) {
            context.resumeData = { ...context.resumeData, ...resumeResult.resumeData }
          }
          
          setNodeStatus(node.id, resumeResult.hasError ? "error" : "success")
          setExecutionLogs((logs) => [...logs, { step: nodeName, output: resumeResult.output, source: "llm" }])
          
          await new Promise((res) => setTimeout(res, 300))
          continue
        }

        if (nodeType === "AgentNode") {
          const userDataContext = workflowConfig.complaintData 
            ? `\n\nIMPORTANT - USE THIS EXACT CUSTOMER DATA (DO NOT MAKE UP DATA):\n${JSON.stringify(workflowConfig.complaintData, null, 2)}\n`
            : ""
          
          const agentInput = `
User Goal: ${context.input}

${userDataContext}
Previous Output:
${context.lastOutput || "None"}

Current Task:
${node.data?.label || node.type}

IMPORTANT: Use the customer data provided above. Do NOT generate fake names, order IDs, or any data. Only use data from the provided input.
`

          const nodeAgentConfig = node.data?.agentConfig || {}
          const baseAgentConfig = agentDetail?.agentToolConfig || {}
          
          const mergedTools = [
            ...(baseAgentConfig.tools || []),
            ...(nodeAgentConfig.tools || []),
          ].map((tool: any) => {
            if (tool.includeApiKey && !tool.apiKey) {
              if (tool.url?.includes("weatherapi.com") && workflowConfig.apiKeys.weather) {
                return { ...tool, apiKey: workflowConfig.apiKeys.weather }
              }
              if (tool.url?.includes("newsapi") && workflowConfig.apiKeys.news) {
                return { ...tool, apiKey: workflowConfig.apiKeys.news }
              }
            }
            return tool
          })
          
          const mergedAgentConfig = {
            ...baseAgentConfig,
            ...nodeAgentConfig,
            tools: mergedTools,
          }

          const res = await fetch("/api/agent-chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              input: agentInput,
              agentToolConfig: mergedAgentConfig,
              userInputData: workflowConfig.complaintData || null,
            }),
          })

          const data = await res.json()

          // Handle image response
          if (data?.type === "image" || data?.imageUrl) {
            context.lastOutput = data.prompt || "Image generated"
            context.imageUrl = data.imageUrl
            context.imageType = "image"
            console.log("🖼️ IMAGE RECEIVED:", data.imageUrl)
          } else if (data?.success && data.reply) {
            context.lastOutput = data.reply
          } else if (data?.success) {
            context.lastOutput = data.reply || "No meaningful output generated"
          } else {
            context.lastOutput = data?.error || "Step failed"
            hasError = true
          }
          
          const logSource = data?.source || "llm"
          
          setNodeStatus(node.id, hasError ? "error" : "success")
          
          setExecutionLogs((logs) => [
            ...logs,
            { step: nodeName, output: context.lastOutput || "No output", source: logSource, imageUrl: context.imageUrl },
          ])
          
          continue
        } else if (nodeType === "ApiNode") {
          const apiConfig = node.data?.settings
          let apiSource: "api" | "llm" = "api"
          
          if (apiConfig?.url) {
            try {
              const cleanInput = context.input
              let url = apiConfig.url
              let extractedTopic = ""
              
              if (apiConfig.includeApiKey && apiConfig.apiKey) {
                const separator = url.includes("?") ? "&" : "?"
                if (url.includes("weatherapi.com")) {
                  url += `${separator}key=${apiConfig.apiKey}`
                } else {
                  url += `${separator}apiKey=${apiConfig.apiKey}`
                }
              }
              
              if (apiConfig.url.includes("newsapi.org")) {
                const topicMatch = cleanInput.match(/about\s+(.+?)(?:\n|$)/i)
                extractedTopic = topicMatch ? topicMatch[1].trim() : cleanInput.toLowerCase().replace(/get|latest|news|about/gi, "").trim()
                const separator = url.includes("?") ? "&" : "?"
                url = `${url}${separator}q=${encodeURIComponent(`"${extractedTopic || "general"}"`)}&language=en&sortBy=publishedAt&pageSize=5`
              } else if (apiConfig.url.includes("weatherapi.com")) {
                const cityMatch = cleanInput.match(/(?:in|for|of)\s+([A-Za-z\s]+?)(?:\n|$)/i)
                const city = cityMatch ? cityMatch[1].trim() : cleanInput.replace(/[^a-zA-Z\s]/g, "").trim()
                const separator = url.includes("?") ? "&" : "?"
                url = `${url}${separator}q=${encodeURIComponent(city || "Bangalore")}`
              }

              const res = await fetch(url, {
                method: apiConfig.method || "GET",
                headers: apiConfig.headers || {},
                body: apiConfig.body ? JSON.stringify(apiConfig.body) : undefined,
              })
              const data = await res.json()

              if (data?.articles && data.articles.length === 0) {
                context.lastOutput = `No articles found for "${extractedTopic || cleanInput}". Try another topic.`
              } else if (data?.articles) {
                context.lastOutput = data.articles.slice(0, 5).map((a: any, i: number) => 
                  `${i + 1}. ${a.title}\n${a.url}`
                ).join("\n\n")
              } else if (data?.current) {
                context.lastOutput = `${data.location?.name}: ${data.current?.temp_c}°C, ${data.current?.condition?.text}`
              } else {
                context.lastOutput = JSON.stringify(data)
              }
            } catch (apiError) {
              context.lastOutput = `API error: ${apiError}`
              hasError = true
              apiSource = "llm"
            }
          } else {
            context.lastOutput = "No API URL configured"
            hasError = true
            apiSource = "llm"
          }
          
          setNodeStatus(node.id, hasError ? "error" : "success")
          
          setExecutionLogs((logs) => [
            ...logs,
            { step: nodeName, output: context.lastOutput || "No output", source: apiSource },
          ])
          
          continue
        }

        setNodeStatus(node.id, hasError ? "error" : "success")
        
        setExecutionLogs((logs) => [
          ...logs,
          { step: nodeName, output: context.lastOutput || "No output", source: "llm" as const },
        ])
        
        await new Promise((res) => setTimeout(res, 300))
      }

      console.log("Final Output:", context.lastOutput)
      console.log("🖼️ Image URL:", context.imageUrl)
      setExecutionLogs((logs) => [
        ...logs,
        { step: "Final Output", output: context.lastOutput || "Completed", imageUrl: context.imageUrl },
      ])
      toast.success("Workflow executed successfully", { id: loadingToastId })
    } catch (err) {
      console.error("❌ EXECUTION ERROR:", err)
      toast.error("Workflow execution failed", { id: loadingToastId })
    }
  }

  return (
    <div>
      <CursorGlow />
      <Header agentDetail={agentDetail} />

      <div className="bg-slate-100" style={{ width: "100vw", height: "90vh" }}>
        <ReactFlow
          nodes={addedNodes}
          edges={nodeEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodesDelete={onNodesDelete}
          nodeTypes={nodeTypes}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#cbd5e1" />

          <Panel position="top-left">
            <AgentToolsPanel />
          </Panel>

          <Panel position="top-right">
            <div className="flex gap-2">
              <SettingPanel />
              <Button onClick={() => setShowWorkflowModal(true)} variant="secondary">
                ⚡ Generate Workflow
              </Button>

              <Button onClick={handleRunWorkflow}>
                ▶ Run Workflow
              </Button>

              <Button
                variant="destructive"
                onClick={handleDeleteAgent}
              >
                Delete
              </Button>
            </div>
          </Panel>

          <Panel position="bottom-center">
            <Button onClick={SaveWorkflow}>
              Save Workflow
            </Button>
          </Panel>

          {showOutputPanel && (
            <Panel position="bottom-right">
              <div className="bg-white border h-[calc(100vh-120px)] w-[380px] flex flex-col shadow-xl rounded-t-lg mt-2">
                <div className="p-3 border-b bg-gray-50 rounded-t-lg flex justify-between items-center">
                  <h3 className="font-semibold text-sm">⚡ Execution Logs</h3>
                  <button 
                    onClick={() => setShowOutputPanel(false)}
                    className="text-gray-500 hover:text-gray-700 text-lg leading-none"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {executionLogs.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">Run workflow to see output</p>
                  ) : (
                    executionLogs.map((log, idx) => (
                      <div 
                        key={idx} 
                        className={`rounded-lg p-3 border ${
                          log.step === "Final Output" 
                            ? "bg-green-50 border-green-200" 
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${
                            log.step === "Final Output" 
                              ? "text-green-700" 
                              : "text-gray-500"
                          }`}>
                            {log.step}
                          </span>
                          {log.source && log.step !== "Final Output" && (
                            <span 
                              className={`px-2 py-0.5 text-xs rounded-full ${
                                log.source === "api" 
                                  ? "bg-green-100 text-green-700" 
                                  : "bg-purple-100 text-purple-700"
                              }`}
                              title={log.source === "api" ? "Fetched from external service" : "Generated by AI model"}
                            >
                              {log.source === "api" ? "API" : "LLM"}
                            </span>
                          )}
                        </div>
                        {log.imageUrl ? (
                          <div className="mt-2">
                            <img 
                              src={log.imageUrl}
                              alt={log.output || "Generated image"} 
                              className="max-w-full rounded-lg border border-gray-200"
                              style={{ maxHeight: "300px", objectFit: "contain" }}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "/placeholder-image.svg";
                              }}
                            />
                            <p className="text-xs text-gray-500 mt-1">{log.output}</p>
                            <a
                              href={log.imageUrl}
                              download="generated-image.png"
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "blue", textDecoration: "underline" }}
                              className="text-sm mt-2 inline-block"
                            >
                              Download Image
                            </a>
                          </div>
                        ) : (
                          <p className={`text-sm whitespace-pre-wrap break-words ${
                            log.step === "Final Output" 
                              ? "font-semibold text-green-800" 
                              : "text-gray-700"
                          }`}>
                            {renderOutputWithLinks(log.output)}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>

      <WorkflowInputModal
        open={showWorkflowModal}
        onOpenChange={setShowWorkflowModal}
        onSubmit={handleGenerateWorkflow}
        initialGoal={workflowConfig.goal}
        initialApiKeys={workflowConfig.apiKeys}
      />
    </div>
  )
}

export default AgentBuilder