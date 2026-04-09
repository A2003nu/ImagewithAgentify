import { createContext } from "react";

interface WorkflowContextType {
  addedNodes: any[];
  setAddedNodes: (nodes: any[]) => void;
  nodeEdges: any[];
  setNodeEdges: (edges: any[]) => void;
  selectedNode: any | null;
  setSelectedNode: (node: any | null) => void;
}

export const WorkflowContext = createContext<WorkflowContextType | null>(null);