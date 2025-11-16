import { dbRun, dbGet, dbAll } from '../connection';
import { DbCalculationTree, DbCalculationNode, CalculationTree, CalculationNode } from '../../types';

export async function createTree(startingNumber: number, userId: number): Promise<number> {
  const result = await dbRun(
    'INSERT INTO calculation_trees (starting_number, user_id) VALUES (?, ?)',
    [startingNumber, userId]
  );
  const treeId = (result as any).lastID;
  
  // Create root node for the tree
  await dbRun(
    'INSERT INTO calculation_nodes (tree_id, parent_node_id, operation, right_argument, result, user_id) VALUES (?, ?, ?, ?, ?, ?)',
    [treeId, null, null, null, startingNumber, userId]
  );
  
  return treeId;
}

export async function findAllTrees(): Promise<CalculationTree[]> {
  const trees = await dbAll(
    `SELECT ct.id, ct.starting_number, ct.user_id, ct.created_at, u.username
     FROM calculation_trees ct
     JOIN users u ON ct.user_id = u.id
     ORDER BY ct.created_at DESC`
  ) as Array<DbCalculationTree & { username: string }>;
  
  const result: CalculationTree[] = [];
  
  for (const tree of trees) {
    const rootNode = await loadTreeWithNodes(tree.id);
    if (rootNode) {
      result.push({
        id: tree.id,
        startingNumber: tree.starting_number,
        userId: tree.user_id,
        username: tree.username,
        rootNode,
        createdAt: tree.created_at
      });
    }
  }
  
  return result;
}

export async function findTreeById(treeId: number): Promise<CalculationTree | null> {
  const tree = await dbGet(
    `SELECT ct.id, ct.starting_number, ct.user_id, ct.created_at, u.username
     FROM calculation_trees ct
     JOIN users u ON ct.user_id = u.id
     WHERE ct.id = ?`,
    [treeId]
  ) as (DbCalculationTree & { username: string }) | undefined;
  
  if (!tree) return null;
  
  const rootNode = await loadTreeWithNodes(treeId);
  if (!rootNode) return null;
  
  return {
    id: tree.id,
    startingNumber: tree.starting_number,
    userId: tree.user_id,
    username: tree.username,
    rootNode,
    createdAt: tree.created_at
  };
}

// Helper function to recursively load tree with all nodes
async function loadTreeWithNodes(treeId: number): Promise<CalculationNode | null> {
  // Get all nodes for this tree
  const nodes = await dbAll(
    `SELECT cn.id, cn.tree_id, cn.parent_node_id, cn.operation, cn.right_argument, 
            cn.result, cn.user_id, cn.created_at, u.username
     FROM calculation_nodes cn
     JOIN users u ON cn.user_id = u.id
     WHERE cn.tree_id = ?
     ORDER BY cn.created_at ASC`,
    [treeId]
  ) as Array<DbCalculationNode & { username: string }>;
  
  if (nodes.length === 0) return null;
  
  // Build node map
  const nodeMap = new Map<number, CalculationNode>();
  
  for (const node of nodes) {
    nodeMap.set(node.id, {
      id: node.id,
      treeId: node.tree_id,
      parentNodeId: node.parent_node_id,
      operation: node.operation as any,
      rightArgument: node.right_argument,
      result: node.result,
      userId: node.user_id,
      username: node.username,
      children: [],
      createdAt: node.created_at
    });
  }
  
  // Build tree structure
  let rootNode: CalculationNode | null = null;
  
  for (const node of nodeMap.values()) {
    if (node.parentNodeId === null) {
      rootNode = node;
    } else {
      const parent = nodeMap.get(node.parentNodeId);
      if (parent) {
        parent.children.push(node);
      }
    }
  }
  
  return rootNode;
}
