import type { WorkflowResult, WorkflowValidationResult } from "./WorkflowType";

export interface AutoWorkflowRequest {
  goal: string;
  options?: {
    context?: string;
    complexity?: "low" | "medium" | "high" | "auto";
    maxSteps?: number;
    preferredTools?: string[];
  };
}

export interface AutoWorkflowMetadata {
  generatedAt: string;
  model: string;
  validation: WorkflowValidationResult;
  warnings?: string[];
}

export interface AutoWorkflowSuccessResponse {
  success: true;
  workflow: WorkflowResult;
  metadata: AutoWorkflowMetadata;
}

export interface AutoWorkflowErrorResponse {
  success: false;
  error: string;
  details?: string;
  raw?: string;
  warnings?: string[];
}

export type AutoWorkflowResponse =
  | AutoWorkflowSuccessResponse
  | AutoWorkflowErrorResponse;

export interface ApiDocumentation {
  endpoint: string;
  method: string;
  description: string;
  version: string;
  capabilities: string[];
  requestBody: {
    goal: {
      type: string;
      required: boolean;
      description: string;
      example: string;
    };
    options: {
      type: string;
      required: boolean;
      properties: {
        context?: {
          type: string;
          description: string;
          example: string;
        };
        complexity?: {
          type: string;
          enum: string[];
          description: string;
          default: string;
        };
        maxSteps?: {
          type: string;
          description: string;
          example: number;
        };
        preferredTools?: {
          type: string;
          items: { type: string };
          description: string;
        };
      };
    };
  };
  response: {
    success: string;
    workflow: {
      workflowName: string;
      description: string;
      goal: string;
      steps: string;
      agents: string;
      tools: string;
      dependencies: string;
      estimatedComplexity: string;
      estimatedSteps: string;
    };
    metadata: {
      generatedAt: string;
      model: string;
      validation: {
        isValid: string;
        errors: string[];
        warnings: string[];
      };
    };
  };
  example: {
    request: {
      goal: string;
      options: {
        complexity: string;
      };
    };
    response: {
      success: boolean;
      workflow: WorkflowResult;
      metadata: {
        generatedAt: string;
        model: string;
        validation: {
          isValid: boolean;
          errors: string[];
          warnings: string[];
        };
      };
    };
  };
}
