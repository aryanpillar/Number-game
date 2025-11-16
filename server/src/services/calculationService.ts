// Calculation service for performing mathematical operations

export type OperationType = 'add' | 'subtract' | 'multiply' | 'divide';

/**
 * Executes a mathematical operation on two numbers
 * @param leftArgument - The left operand (from previous calculation)
 * @param operation - The operation to perform
 * @param rightArgument - The right operand (user input)
 * @returns The result of the operation
 * @throws Error if division by zero is attempted
 */
export function executeOperation(
  leftArgument: number,
  operation: OperationType,
  rightArgument: number
): number {
  // Validate division by zero
  if (operation === 'divide' && rightArgument === 0) {
    throw new Error('Division by zero is not allowed');
  }

  switch (operation) {
    case 'add':
      return leftArgument + rightArgument;
    case 'subtract':
      return leftArgument - rightArgument;
    case 'multiply':
      return leftArgument * rightArgument;
    case 'divide':
      return leftArgument / rightArgument;
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

/**
 * Computes the result of an operation
 * @param leftArgument - The left operand
 * @param operation - The operation to perform
 * @param rightArgument - The right operand
 * @returns The computed result
 */
export function computeResult(
  leftArgument: number,
  operation: OperationType,
  rightArgument: number
): number {
  return executeOperation(leftArgument, operation, rightArgument);
}

/**
 * Validates if an operation can be performed
 * @param operation - The operation to validate
 * @param rightArgument - The right operand
 * @returns true if valid, false otherwise
 */
export function validateOperation(
  operation: OperationType,
  rightArgument: number
): { valid: boolean; error?: string } {
  if (operation === 'divide' && rightArgument === 0) {
    return { valid: false, error: 'Division by zero is not allowed' };
  }

  if (!['add', 'subtract', 'multiply', 'divide'].includes(operation)) {
    return { valid: false, error: 'Invalid operation type' };
  }

  return { valid: true };
}
