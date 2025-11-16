import { AuthResponse, CalculationTree, CalculationNode, ErrorResponse } from '../types';

const API_BASE_URL = '/api';

class ApiError extends Error {
  constructor(public status: number, public data: ErrorResponse) {
    super(data.message);
    this.name = 'ApiError';
  }
}

// Helper function to get auth token
function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

// Generic fetch wrapper with error handling and auth header injection
async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Merge with any additional headers from options
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    // Handle non-OK responses
    if (!response.ok) {
      let errorData: ErrorResponse;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          error: 'Unknown Error',
          message: `Request failed with status ${response.status}`,
        };
      }
      throw new ApiError(response.status, errorData);
    }

    // Parse and return JSON response
    return await response.json();
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    throw new Error(
      error instanceof Error ? error.message : 'Network request failed'
    );
  }
}

// Authentication API
export const authApi = {
  register: async (username: string, password: string): Promise<{ message: string; userId: number }> => {
    return fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  login: async (username: string, password: string): Promise<AuthResponse> => {
    return fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
};

// Calculation Tree API
export const treeApi = {
  getAllTrees: async (): Promise<{ trees: CalculationTree[] }> => {
    return fetchWithAuth('/trees', {
      method: 'GET',
    });
  },

  createTree: async (startingNumber: number): Promise<{ tree: CalculationTree }> => {
    return fetchWithAuth('/trees', {
      method: 'POST',
      body: JSON.stringify({ startingNumber }),
    });
  },

  addOperation: async (
    treeId: number,
    parentNodeId: number,
    operation: 'add' | 'subtract' | 'multiply' | 'divide',
    rightArgument: number
  ): Promise<{ node: CalculationNode }> => {
    return fetchWithAuth(`/trees/${treeId}/operations`, {
      method: 'POST',
      body: JSON.stringify({ parentNodeId, operation, rightArgument }),
    });
  },
};

export { ApiError };
