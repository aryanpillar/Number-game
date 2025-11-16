import { useState, useEffect, useCallback } from 'react';
import { CalculationTree, CalculationNode } from '../types';
import { treeApi } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { useToast } from '../context/ToastContext';
import TreeNode from './TreeNode';
import CreateStartingNumber from './CreateStartingNumber';
import LoadingSpinner from './LoadingSpinner';
import './CalculationTreeList.css';

function CalculationTreeList() {
  const [trees, setTrees] = useState<CalculationTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchTrees();
  }, []);

  // Handle WebSocket events
  const handleTreeCreated = useCallback((tree: CalculationTree) => {
    setTrees((prevTrees) => [tree, ...prevTrees]);
    showToast('New calculation tree created!', 'info');
  }, [showToast]);

  const handleOperationAdded = useCallback((data: { treeId: number; node: CalculationNode }) => {
    setTrees((prevTrees) => {
      return prevTrees.map((tree) => {
        if (tree.id === data.treeId) {
          // Update the tree by adding the new node to the appropriate parent
          const updatedTree = { ...tree };
          updatedTree.rootNode = addNodeToTree(updatedTree.rootNode, data.node);
          return updatedTree;
        }
        return tree;
      });
    });
    showToast('New operation added to tree!', 'info');
  }, [showToast]);

  // Initialize WebSocket connection
  useWebSocket({
    onTreeCreated: handleTreeCreated,
    onOperationAdded: handleOperationAdded,
  });

  // Helper function to recursively add a node to the tree
  const addNodeToTree = (node: CalculationNode, newNode: CalculationNode): CalculationNode => {
    if (node.id === newNode.parentNodeId) {
      // Found the parent, add the new node to its children
      return {
        ...node,
        children: [...node.children, newNode],
      };
    }

    // Recursively search in children
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: node.children.map((child) => addNodeToTree(child, newNode)),
      };
    }

    return node;
  };

  const fetchTrees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await treeApi.getAllTrees();
      setTrees(response.trees);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calculation trees');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="tree-list-container">
        <div className="loading-state">
          <LoadingSpinner size="large" message="Loading discussions..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tree-list-container">
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={fetchTrees} className="retry-button">Retry</button>
        </div>
      </div>
    );
  }

  if (trees.length === 0) {
    return (
      <div className="tree-list-container">
        <CreateStartingNumber />
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <h3>No Discussions Yet</h3>
          <p>Be the first to start a calculation discussion!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tree-list-container">
      <CreateStartingNumber />
      
      <div className="tree-list-header">
        <h2>Calculation Discussions</h2>
        <p>{trees.length} active {trees.length === 1 ? 'discussion' : 'discussions'}</p>
      </div>

      <div className="tree-list">
        {trees.map((tree) => (
          <div key={tree.id} className="tree-card">
            <div className="tree-header">
              <div className="tree-meta">
                <div className="tree-starting-number">
                  {tree.startingNumber}
                </div>
                <div className="tree-creator">
                  Started by <strong>{tree.username}</strong>
                </div>
              </div>
              <div className="tree-timestamp">
                {new Date(tree.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="tree-content">
              <div className="tree-nodes">
                <TreeNode node={tree.rootNode} isRoot={true} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CalculationTreeList;
