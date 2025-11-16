import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { treeApi, ApiError } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import './AddOperation.css';

interface AddOperationProps {
  treeId: number;
  nodeId: number;
  onClose: () => void;
}

function AddOperation({ treeId, nodeId, onClose }: AddOperationProps) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [operation, setOperation] = useState<'add' | 'subtract' | 'multiply' | 'divide'>('add');
  const [rightArgument, setRightArgument] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate numerical input
    const number = parseFloat(rightArgument);
    if (isNaN(number)) {
      setError('Please enter a valid number');
      return;
    }

    // Validate division by zero
    if (operation === 'divide' && number === 0) {
      setError('Cannot divide by zero');
      return;
    }

    try {
      setLoading(true);
      await treeApi.addOperation(treeId, nodeId, operation, number);
      showToast('Operation added successfully!', 'success');
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.data.message);
        showToast(err.data.message, 'error');
      } else {
        const errorMsg = err instanceof Error ? err.message : 'Failed to add operation';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-operation-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Add Operation</h3>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="operation-form">
          <div className="form-group">
            <label htmlFor="operation">Operation:</label>
            <select
              id="operation"
              value={operation}
              onChange={(e) => setOperation(e.target.value as 'add' | 'subtract' | 'multiply' | 'divide')}
              disabled={loading}
            >
              <option value="add">Addition (+)</option>
              <option value="subtract">Subtraction (−)</option>
              <option value="multiply">Multiplication (×)</option>
              <option value="divide">Division (÷)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="rightArgument">Right Argument:</label>
            <input
              type="text"
              id="rightArgument"
              value={rightArgument}
              onChange={(e) => setRightArgument(e.target.value)}
              placeholder="Enter a number"
              disabled={loading}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading || !rightArgument}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <LoadingSpinner size="small" />
                  Adding...
                </span>
              ) : (
                'Add Operation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddOperation;
