import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { treeApi, ApiError } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import './CreateStartingNumber.css';

function CreateStartingNumber() {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [startingNumber, setStartingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate numerical input
    const number = parseFloat(startingNumber);
    if (isNaN(number)) {
      setError('Please enter a valid number');
      return;
    }

    try {
      setLoading(true);
      await treeApi.createTree(number);
      showToast('Calculation tree created successfully!', 'success');
      setStartingNumber('');
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.data.message);
        showToast(err.data.message, 'error');
      } else {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create tree';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-starting-number">
      <h3>Create New Calculation Tree</h3>
      <form onSubmit={handleSubmit} className="starting-number-form">
        <div className="form-group">
          <label htmlFor="startingNumber">Starting Number:</label>
          <input
            type="text"
            id="startingNumber"
            value={startingNumber}
            onChange={(e) => setStartingNumber(e.target.value)}
            placeholder="Enter a number"
            disabled={loading}
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading || !startingNumber}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <LoadingSpinner size="small" />
              Creating...
            </span>
          ) : (
            'Create Tree'
          )}
        </button>
      </form>
    </div>
  );
}

export default CreateStartingNumber;
