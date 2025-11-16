import { useState } from 'react';
import { CalculationNode } from '../types';
import { useAuth } from '../context/AuthContext';
import AddOperation from './AddOperation';
import './TreeNode.css';

interface TreeNodeProps {
  node: CalculationNode;
  isRoot?: boolean;
}

function TreeNode({ node, isRoot = false }: TreeNodeProps) {
  const { isAuthenticated } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddOperation, setShowAddOperation] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  const toggleExpand = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const getOperationSymbol = (operation: string | null): string => {
    switch (operation) {
      case 'add':
        return '+';
      case 'subtract':
        return '-';
      case 'multiply':
        return '×';
      case 'divide':
        return '÷';
      default:
        return '';
    }
  };

  const formatResult = (result: number): string => {
    // Format to avoid floating point precision issues
    return Number.isInteger(result) ? result.toString() : result.toFixed(2);
  };

  const getInitial = (username: string): string => {
    return username.charAt(0).toUpperCase();
  };

  const getParentValue = (): number => {
    // For non-root nodes, calculate parent value from result and operation
    if (isRoot || !node.operation || !node.rightArgument) {
      return node.result;
    }
    
    switch (node.operation) {
      case 'add':
        return node.result - node.rightArgument;
      case 'subtract':
        return node.result + node.rightArgument;
      case 'multiply':
        return node.result / node.rightArgument;
      case 'divide':
        return node.result * node.rightArgument;
      default:
        return node.result;
    }
  };

  return (
    <div className={`tree-node ${isRoot ? 'root-node' : ''}`}>
      <div className="node-content">
        <div className="node-avatar">
          {getInitial(node.username)}
        </div>
        
        <div className="node-main">
          <div className="node-header">
            <span className="node-author">{node.username}</span>
            <span className="node-timestamp">
              {new Date(node.createdAt).toLocaleString()}
            </span>
          </div>

          {isRoot ? (
            <div className="node-calculation">
              <span className="node-result">{formatResult(node.result)}</span>
            </div>
          ) : (
            <div className="node-calculation">
              <span className="node-parent-value">{formatResult(getParentValue())}</span>
              <span className="node-operation">{getOperationSymbol(node.operation)}</span>
              <span className="node-right-arg">{formatResult(node.rightArgument!)}</span>
              <span className="node-equals">=</span>
              <span className="node-result">{formatResult(node.result)}</span>
            </div>
          )}

          {isAuthenticated && (
            <div className="node-actions">
              <button 
                className="add-operation-button"
                onClick={() => setShowAddOperation(true)}
              >
                Add Reply
              </button>
            </div>
          )}
        </div>
      </div>

      {showAddOperation && (
        <AddOperation
          treeId={node.treeId}
          nodeId={node.id}
          onClose={() => setShowAddOperation(false)}
        />
      )}

      {hasChildren && (
        <div className="node-children">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} isRoot={false} />
          ))}
        </div>
      )}
    </div>
  );
}

export default TreeNode;
