"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Cloud, Newspaper, Key, Zap, FileText, Upload, Briefcase, AlertCircle, Package, Clock, User } from "lucide-react"

interface WorkflowInputModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (config: { 
    goal: string; 
    apiKeys: Record<string, string>;
    jobRole?: string;
    resumeText?: string;
    pdfFile?: File | null;
    complaintData?: {
      customerName: string;
      orderId: string;
      issueType: string;
      delayDays: number;
    };
  }) => void
  initialGoal?: string
  initialApiKeys?: Record<string, string>
}

const detectTools = (goal: string) => {
  const g = goal.toLowerCase();
  return {
    news: g.includes("news"),
    weather: g.includes("weather") || g.includes("temperature") || g.includes("forecast"),
  };
};

const detectResumePrompt = (goal: string) => {
  const g = goal.toLowerCase();
  const keywords = ["resume", "cv", "analyze resume", "candidate", "hiring", "screen resume", "screen candidate", "job application", "applicant", "interview candidate", "candidate screening", "resume screening", "evaluate resume", "shortlist candidate"];
  return keywords.some(keyword => g.includes(keyword));
};

const detectComplaintWorkflow = (goal: string) => {
  const g = goal.toLowerCase();
  const keywords = ["complaint", "customer issue", "late delivery", "refund", "order problem", "support", "damaged", "missing item", "wrong item", "delayed order", "order delay"];
  return keywords.some(keyword => g.includes(keyword));
};

export function WorkflowInputModal({
  open,
  onOpenChange,
  onSubmit,
  initialGoal = "",
  initialApiKeys = {},
}: WorkflowInputModalProps) {
  const [goal, setGoal] = useState(initialGoal)
  const [apiKeys, setApiKeys] = useState<Record<string, string>>(initialApiKeys)
  const [jobRole, setJobRole] = useState("")
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [manualResume, setManualResume] = useState("")
  const [showManualInput, setShowManualInput] = useState(false)
  const [detectedApis, setDetectedApis] = useState<{ news: boolean; weather: boolean }>({
    news: false,
    weather: false,
  })
  const [isResumeMode, setIsResumeMode] = useState(false)
  const [isComplaintMode, setIsComplaintMode] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [orderId, setOrderId] = useState("")
  const [issueType, setIssueType] = useState("Late Delivery")
  const [delayDays, setDelayDays] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setGoal(initialGoal)
      setApiKeys(initialApiKeys)
      setJobRole("")
      setPdfFile(null)
      setManualResume("")
      setShowManualInput(false)
      setCustomerName("")
      setOrderId("")
      setIssueType("Late Delivery")
      setDelayDays("")
    }
  }, [open, initialGoal, initialApiKeys])

  useEffect(() => {
    setDetectedApis(detectTools(goal))
    setIsResumeMode(detectResumePrompt(goal))
    setIsComplaintMode(detectComplaintWorkflow(goal))
  }, [goal])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type === "application/pdf") {
        setPdfFile(file)
        setShowManualInput(false)
      } else {
        alert("Please upload a PDF file")
      }
    }
  }

  const extractPdfText = async (file: File): Promise<string> => {
    try {
      console.log("📄 Starting PDF text extraction via backend API...");
      console.log(`📄 File name: ${file.name}`);
      console.log(`📄 File size: ${file.size} bytes`);
      
      const formData = new FormData();
      formData.append("file", file);
      
      console.log("📄 Sending request to /api/parse-resume...");
      
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (!data.text) {
        console.error("❌ Backend PDF parsing failed:", data.error);
        throw new Error(data.error || "Failed to parse PDF");
      }
      
      const extractedText = data.text;
      
      console.log("✅ CLEAN EXTRACTED TEXT PREVIEW:");
      console.log("----------------------------------------");
      console.log(extractedText.substring(0, 1000));
      console.log("----------------------------------------");
      console.log("📏 Text length:", extractedText.length);
      
      // ===== DEBUG LOGGING =====
      console.log("\n========================================");
      console.log("📋 PDF EXTRACTION DEBUG REPORT");
      console.log("========================================\n");
      
      if (extractedText.length > 0) {
        console.log("📄 PREVIEW START (first 1000 chars):");
        console.log("----------------------------------------");
        console.log(extractedText.substring(0, 1000));
        console.log("----------------------------------------\n");
        
        console.log("📄 PREVIEW END (last 1000 chars):");
        console.log("----------------------------------------");
        console.log(extractedText.substring(Math.max(0, extractedText.length - 1000)));
        console.log("----------------------------------------\n");
      }
      
      console.log("🔍 Checking important resume keywords...");
      console.log("----------------------------------------");
      const keywords = ["experience", "education", "skills", "projects", "internship", "certification", "achievements"];
      keywords.forEach((keyword: string) => {
        if (extractedText.toLowerCase().includes(keyword)) {
          console.log(`✅ Found keyword: "${keyword}"`);
        } else {
          console.log(`❌ Missing keyword: "${keyword}"`);
        }
      });
      console.log("----------------------------------------\n");
      
      const wordMatches = extractedText.match(/[a-zA-Z]{4,}/g);
      if (wordMatches && wordMatches.length > 0) {
        console.log("✅ Text looks readable (valid words detected)");
        console.log(`📊 Word count (4+ chars): ${wordMatches.length}`);
      } else {
        console.warn("⚠️ Extracted text may be corrupted or unreadable");
      }
      console.log("----------------------------------------\n");
      
      console.log("========================================");
      console.log("📋 END DEBUG REPORT");
      console.log("========================================\n");
      // ===== END DEBUG LOGGING =====
      
      return extractedText
    } catch (error) {
      console.error("❌ PDF extraction failed:", error);
      throw error;
    }
  }

  const handleSubmit = async () => {
    if (!goal.trim()) return
    
    if (isResumeMode && !jobRole.trim()) {
      alert("Please enter a job role for resume screening")
      return
    }

    if (isComplaintMode && (!customerName.trim() || !orderId.trim())) {
      alert("Please enter customer name and order ID")
      return
    }
    
    let resumeText = ""

    if (pdfFile) {
      try {
        resumeText = await extractPdfText(pdfFile)
      } catch {
        alert("Failed to extract text from PDF. Please use manual input instead.")
        setShowManualInput(true)
        return
      }
    } else if (showManualInput && manualResume.trim()) {
      resumeText = manualResume
    } else if (isResumeMode && !pdfFile && !manualResume.trim()) {
      alert("Please upload a PDF resume or provide manual input")
      return
    }

    const submitData: { 
      goal: string; 
      apiKeys: Record<string, string>;
      jobRole?: string;
      resumeText?: string;
      pdfFile?: File | null;
      complaintData?: {
        customerName: string;
        orderId: string;
        issueType: string;
        delayDays: number;
      };
    } = { 
      goal: goal.trim(), 
      apiKeys,
      jobRole: isResumeMode ? jobRole.trim() : undefined,
      resumeText: resumeText || undefined,
      pdfFile: pdfFile || undefined
    }

    if (isComplaintMode) {
      submitData.complaintData = {
        customerName: customerName.trim(),
        orderId: orderId.trim(),
        issueType,
        delayDays: parseInt(delayDays) || 0,
      }
    }
    
    onSubmit(submitData)
    onOpenChange(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && goal.trim()) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Workflow Generator
          </DialogTitle>
          <DialogDescription>
            Describe what you want your workflow to accomplish. We&apos;ll detect required APIs automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              What would you like to automate?
            </label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isResumeMode ? "e.g., Screen candidate resume for interview" : "e.g., Get weather and latest news for Bangalore"}
              className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              autoFocus
            />
          </div>

          {isResumeMode && (
            <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  Resume Screening Mode
                </span>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Enter Job Role (Required)
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Full Stack Developer, Data Scientist, Backend Engineer"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    This will be used to match candidate skills with job requirements
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Upload Resume (PDF only)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      pdfFile 
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
                        : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                    }`}
                  >
                    {pdfFile ? (
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-green-700 dark:text-green-400">{pdfFile.name}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            setPdfFile(null)
                          }}
                          className="ml-auto text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-6 w-6 text-gray-400" />
                        <span className="text-sm text-gray-500">Click to upload PDF</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Or provide manual input</span>
                  <Button 
                    variant="link" 
                    size="sm"
                    onClick={() => setShowManualInput(!showManualInput)}
                  >
                    {showManualInput ? "Hide" : "Show"} Manual Input
                  </Button>
                </div>

                {showManualInput && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Manual Resume Data
                    </label>
                    <textarea
                      value={manualResume}
                      onChange={(e) => setManualResume(e.target.value)}
                      placeholder="Paste resume content here:&#10;&#10;Name:&#10;Skills:&#10;Experience:&#10;Education:&#10;Projects:"
                      className="w-full min-h-[150px] p-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  </div>
                )}

                {!pdfFile && !showManualInput && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Please upload a PDF resume or use manual input to proceed with screening
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {isComplaintMode && (
            <div className="space-y-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm font-medium text-red-700 dark:text-red-400">
                  🧾 Customer Complaint Mode Activated
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    Customer Name
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Rahul Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    Order ID
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., ORD123456"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Issue Type
                  </label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full border rounded-md p-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="Late Delivery">Late Delivery</option>
                    <option value="Damaged Product">Damaged Product</option>
                    <option value="Missing Item">Missing Item</option>
                    <option value="Wrong Item">Wrong Item</option>
                    <option value="Refund Request">Refund Request</option>
                    <option value="Quality Issue">Quality Issue</option>
                    <option value="Billing Error">Billing Error</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    Delay in Days (optional)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 3"
                    value={delayDays}
                    onChange={(e) => setDelayDays(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {!isResumeMode && !isComplaintMode && goal.trim() && (detectedApis.weather || detectedApis.news) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Detected APIs
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {detectedApis.weather && (
                  <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
                    <Cloud className="h-3.5 w-3.5 text-blue-500" />
                    Weather
                  </Badge>
                )}
                {detectedApis.news && (
                  <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
                    <Newspaper className="h-3.5 w-3.5 text-green-500" />
                    News
                  </Badge>
                )}
              </div>

              <div className="space-y-3 mt-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    API Keys (Optional)
                  </span>
                  <Badge variant="outline" className="text-xs">Skip to use LLM fallback</Badge>
                </div>

                <div className="space-y-3">
                  {detectedApis.weather && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Weather API Key (weatherapi.com)
                      </label>
                      <Input
                        type="password"
                        placeholder="Enter your weather API key"
                        value={apiKeys.weather || ""}
                        onChange={(e) =>
                          setApiKeys((prev) => ({ ...prev, weather: e.target.value }))
                        }
                      />
                      <p className="text-xs text-gray-400">
                        Without this, AI will provide weather information from its knowledge.
                      </p>
                    </div>
                  )}

                  {detectedApis.news && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        News API Key (newsapi.org)
                      </label>
                      <Input
                        type="password"
                        placeholder="Enter your news API key"
                        value={apiKeys.news || ""}
                        onChange={(e) =>
                          setApiKeys((prev) => ({ ...prev, news: e.target.value }))
                        }
                      />
                      <p className="text-xs text-gray-400">
                        Without this, AI will provide news from its training data.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!isResumeMode && goal.trim() && !detectedApis.weather && !detectedApis.news && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-400">
                No external APIs detected. The workflow will use AI capabilities only.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!goal.trim() || (isResumeMode && !jobRole.trim()) || (isComplaintMode && (!customerName.trim() || !orderId.trim()))}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Workflow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
