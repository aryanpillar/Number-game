import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { createTree, findAllTrees, findTreeById } from '../database/repositories/treeRepository';
import { createNode, findNodeById } from '../database/repositories/nodeRepository';
import { executeOperation, validateOperation, OperationType } from '../services/calculationService';
import { websocketService } from '../services/websocketService';

const router = Router();

/**
 * GET /api/trees
 * Fetch all calculation trees with nodes
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const trees = await findAllTrees();
    res.status(200).json({ trees });
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/trees
 * Create a new calculation tree with a starting number (protected)
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { startingNumber } = req.body;
    const userId = req.user!.userId;

    // Validate input
    if (startingNumber === undefined || startingNumber === null) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Starting number is required'
      });
      return;
    }

    if (typeof startingNumber !== 'number' || isNaN(startingNumber)) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Starting number must be a valid number'
      });
      return;
    }

    // Create tree
    const treeId = await createTree(startingNumber, userId);
    const tree = await findTreeById(treeId);

    // Broadcast tree_created event to all WebSocket clients
    websocketService.broadcastTreeCreated(tree);

    res.status(201).json({ tree });
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/trees/:treeId/operations
 * Add an operation to a calculation node (protected)
 */
router.post('/:treeId/operations', authenticateToken, async (req: Request, res: Response) => {
  try {
    const treeId = parseInt(req.params.treeId, 10);
    const { parentNodeId, operation, rightArgument } = req.body;
    const userId = req.user!.userId;

    // Validate treeId
    if (isNaN(treeId)) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid tree ID'
      });
      return;
    }

    // Validate input
    if (!parentNodeId || !operation || rightArgument === undefined || rightArgument === null) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Parent node ID, operation, and right argument are required'
      });
      return;
    }

    if (typeof parentNodeId !== 'number' || isNaN(parentNodeId)) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Parent node ID must be a valid number'
      });
      return;
    }

    if (typeof rightArgument !== 'number' || isNaN(rightArgument)) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Right argument must be a valid number'
      });
      return;
    }

    // Validate operation type
    const validOperations: OperationType[] = ['add', 'subtract', 'multiply', 'divide'];
    if (!validOperations.includes(operation)) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Operation must be one of: add, subtract, multiply, divide'
      });
      return;
    }

    // Validate operation (e.g., division by zero)
    const validation = validateOperation(operation, rightArgument);
    if (!validation.valid) {
      res.status(400).json({
        error: 'ValidationError',
        message: validation.error
      });
      return;
    }

    // Find parent node
    const parentNode = await findNodeById(parentNodeId);
    if (!parentNode) {
      res.status(404).json({
        error: 'NotFoundError',
        message: 'Parent node not found'
      });
      return;
    }

    // Verify parent node belongs to the specified tree
    if (parentNode.tree_id !== treeId) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Parent node does not belong to the specified tree'
      });
      return;
    }

    // Calculate result
    const result = executeOperation(parentNode.result, operation, rightArgument);

    // Create new node
    const nodeId = await createNode(
      treeId,
      parentNodeId,
      operation,
      rightArgument,
      result,
      userId
    );

    // Fetch the created node with username
    const createdNode = await findNodeById(nodeId);

    // Broadcast operation_added event to all WebSocket clients
    websocketService.broadcastOperationAdded(treeId, createdNode);

    res.status(201).json({ node: createdNode });
  } catch (error) {
    throw error;
  }
});

export default router;
