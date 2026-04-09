"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Brain, Target, Heart, Zap, MessageCircle, CheckCircle, AlertTriangle, ThumbsUp, Package, Clock, DollarSign, User, Search, BarChart3, Wrench } from "lucide-react";

type DecisionResult = {
  intent: string;
  sentiment: string;
  confidence: number;
  reasoning: string;
  priority: string;
  action: string;
  response: string;
  customerName: string;
  orderId: string;
  issueType: string;
  delayDays: number;
  compensation: string;
  compensationValue: number;
  logs: string[];
  analysis?: {
    rootCause: string;
    resolutionStatus: string;
    severity: string;
  };
};

function DecisionAgentPage() {
  const [customerName, setCustomerName] = useState("");
  const [orderId, setOrderId] = useState("");
  const [issueType, setIssueType] = useState("");
  const [delayDays, setDelayDays] = useState("");
  const [additionalMessage, setAdditionalMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DecisionResult | null>(null);

  const issueTypes = [
    "Late Delivery",
    "Damaged Product",
    "Wrong Item",
    "Missing Item",
    "Quality Issue",
    "Billing Error",
    "Other",
  ];

  const analyze = async () => {
    if (!customerName.trim() || !orderId.trim() || !issueType) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/decision-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          orderId,
          issueType,
          delayDays: parseInt(delayDays) || 0,
          additionalMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700 border-red-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Low":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return <ThumbsUp className="w-5 h-5 text-green-500" />;
      case "Negative":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Target className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes("Escalate")) {
      return <Zap className="w-5 h-5 text-red-600" />;
    } else if (action.includes("Appreciation")) {
      return <Heart className="w-5 h-5 text-green-600" />;
    }
    return <MessageCircle className="w-5 h-5 text-blue-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Smart Task Decision Agent
          </h1>
          <p className="text-gray-400">
            Data-driven customer complaint handling
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Customer Complaint Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Customer Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g., Rahul Sharma"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Order ID</label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g., ORD123456"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Issue Type</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="">Select issue type</option>
                  {issueTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Delay (days)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="number"
                    value={delayDays}
                    onChange={(e) => setDelayDays(e.target.value)}
                    placeholder="e.g., 3"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Additional Message (optional)</label>
                <textarea
                  value={additionalMessage}
                  onChange={(e) => setAdditionalMessage(e.target.value)}
                  className="w-full border rounded-lg p-3 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Any additional details..."
                />
              </div>
            </div>
            <Button
              onClick={analyze}
              disabled={loading || !customerName.trim() || !orderId.trim() || !issueType}
              className="mt-4 w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Analyze & Process <Brain className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-purple-900 to-indigo-900 border-2 border-purple-400">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-purple-400" />
                  💬 Customer Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white/10 p-6 rounded-lg">
                  <p className="text-white text-lg leading-relaxed whitespace-pre-line">{result.response}</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-2 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-purple-700">
                    <Search className="w-4 h-4" />
                    📊 Complaint Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Customer</span>
                    <span className="font-semibold">{result.customerName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Order ID</span>
                    <span className="font-mono font-semibold">{result.orderId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Issue</span>
                    <span className="font-semibold">{result.issueType}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">Delay</span>
                    <span className="font-semibold">{result.delayDays} days</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-200">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-orange-700">
                    <Search className="w-4 h-4" />
                    🔍 Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Root Cause</span>
                    <span className="font-medium text-sm">{result.analysis?.rootCause || "To be determined"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Severity</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(result.priority)}`}>
                      {result.priority}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Sentiment</span>
                    <span className="font-medium flex items-center gap-1">
                      {getSentimentIcon(result.sentiment)}
                      {result.sentiment}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">Impact</span>
                    <span className="font-medium text-sm">{result.priority === "High" ? "Customer dissatisfaction" : "Minor inconvenience"}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-green-700">
                    <Wrench className="w-4 h-4" />
                    🛠 Resolution Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-green-600">1.</span>
                      <span>Verify order status and delivery location</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-green-600">2.</span>
                      <span>Contact customer with delivery update</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-green-600">3.</span>
                      <span>Offer compensation: {result.compensation}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-green-600">4.</span>
                      <span>Follow up to ensure satisfaction</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>

              <Card className="border-2 border-indigo-200">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-indigo-700">
                    <BarChart3 className="w-4 h-4" />
                    📈 Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Resolution</span>
                    <span className="font-semibold">{result.analysis?.resolutionStatus || "In Progress"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Confidence</span>
                    <span className="font-bold text-lg">{result.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${result.confidence}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-gray-500 text-sm">Action Taken</span>
                    <span className="font-medium text-sm">{result.action}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Execution Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black rounded-lg p-4 font-mono text-sm text-green-400 max-h-[200px] overflow-y-auto">
                  {result.logs.map((log, idx) => (
                    <div key={idx} className="mb-1">
                      {log}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-900 to-emerald-900 border-2 border-green-400">
              <CardContent className="py-4">
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Workflow completed successfully</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default DecisionAgentPage;
