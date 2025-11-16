import { dbRun, dbGet, dbAll } from '../connection';
import { DbCalculationNode, CalculationNode } from '../../types';

export async function createNode(
  treeId: number,
  parentNodeId: number,
  operation: string,
  rightArgument: number,
  result: number,
  userId: number
): Promise<number> {
  const nodeResult = await dbRun(
    `INSERT INTO calculation_nodes (tree_id, parent_node_id, operation, right_argument, result, user_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [treeId, parentNodeId, operation, rightArgument, result, userId]
  );
  return (nodeResult as any).lastID;
}

export async function findNodesByTreeId(treeId: number): Promise<CalculationNode[]> {
  const nodes = await dbAll(
    `SELECT cn.id, cn.tree_id, cn.parent_node_id, cn.operation, cn.right_argument,
            cn.result, cn.user_id, cn.created_at, u.username
     FROM calculation_nodes cn
     JOIN users u ON cn.user_id = u.id
     WHERE cn.tree_id = ?
     ORDER BY cn.created_at ASC`,
    [treeId]
  ) as Array<DbCalculationNode & { username: string }>;
  
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
  
  // Build tree structure by linking children to parents
  const result: CalculationNode[] = [];
  
  for (const node of nodeMap.values()) {
    if (node.parentNodeId === null) {
      result.push(node);
    } else {
      const parent = nodeMap.get(node.parentNodeId);
      if (parent) {
        parent.children.push(node);
      }
    }
  }
  
  return result;
}

export async function findNodeById(nodeId: number): Promise<DbCalculationNode | null> {
  const node = await dbGet(
    `SELECT id, tree_id, parent_node_id, operation, right_argument, result, user_id, created_at
     FROM calculation_nodes
     WHERE id = ?`,
    [nodeId]
  );
  return node as DbCalculationNode | null;
}
