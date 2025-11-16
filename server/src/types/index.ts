// Shared types for the application

export interface User {
  id: number;
  username: string;
  password_hash?: string;
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

export interface DbUser {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface DbCalculationTree {
  id: number;
  starting_number: number;
  user_id: number;
  created_at: string;
}

export interface DbCalculationNode {
  id: number;
  tree_id: number;
  parent_node_id: number | null;
  operation: string | null;
  right_argument: number | null;
  result: number;
  user_id: number;
  created_at: string;
}
