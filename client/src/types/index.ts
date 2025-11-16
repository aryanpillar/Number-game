// Shared TypeScript interfaces matching backend

export interface User {
  id: number;
  username: string;
}

export interface CalculationNode {
  id: number;
  treeId: number;
  parentNodeId: number | null;
  operation: 'add' | 'subtract' | 'multiply' | 'divide' | null;
  rightArgument: number | null;
  result: number;
  userId: number;
  username: string;
  children: CalculationNode[];
  createdAt: string;
}

export interface CalculationTree {
  id: number;
  startingNumber: number;
  userId: number;
  username: string;
  rootNode: CalculationNode;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  userId: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
}
