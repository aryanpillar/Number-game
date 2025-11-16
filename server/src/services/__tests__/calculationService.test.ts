import {
  executeOperation,
  computeResult,
  validateOperation,
  OperationType
} from '../calculationService';

describe('Calculation Service', () => {
  describe('executeOperation', () => {
    describe('Addition', () => {
      test('should add two positive integers', () => {
        const result = executeOperation(5, 'add', 3);
        expect(result).toBe(8);
      });

      test('should add positive and negative numbers', () => {
        const result = executeOperation(10, 'add', -5);
        expect(result).toBe(5);
      });

      test('should add decimal numbers with precision', () => {
        const result = executeOperation(0.1, 'add', 0.2);
        expect(result).toBeCloseTo(0.3, 10);
      });
    });

    describe('Subtraction', () => {
      test('should subtract two positive integers', () => {
        const result = executeOperation(10, 'subtract', 3);
        expect(result).toBe(7);
      });

      test('should subtract resulting in negative number', () => {
        const result = executeOperation(5, 'subtract', 10);
        expect(result).toBe(-5);
      });

      test('should subtract decimal numbers with precision', () => {
        const result = executeOperation(0.5, 'subtract', 0.2);
        expect(result).toBeCloseTo(0.3, 10);
      });
    });

    describe('Multiplication', () => {
      test('should multiply two positive integers', () => {
        const result = executeOperation(4, 'multiply', 5);
        expect(result).toBe(20);
      });

      test('should multiply by zero', () => {
        const result = executeOperation(10, 'multiply', 0);
        expect(result).toBe(0);
      });

      test('should multiply decimal numbers with precision', () => {
        const result = executeOperation(0.5, 'multiply', 0.4);
        expect(result).toBeCloseTo(0.2, 10);
      });

      test('should multiply negative numbers', () => {
        const result = executeOperation(-3, 'multiply', 4);
        expect(result).toBe(-12);
      });
    });

    describe('Division', () => {
      test('should divide two positive integers', () => {
        const result = executeOperation(10, 'divide', 2);
        expect(result).toBe(5);
      });

      test('should divide resulting in decimal', () => {
        const result = executeOperation(10, 'divide', 3);
        expect(result).toBeCloseTo(3.333333, 5);
      });

      test('should divide decimal numbers with precision', () => {
        const result = executeOperation(0.6, 'divide', 0.2);
        expect(result).toBeCloseTo(3, 10);
      });

      test('should throw error when dividing by zero', () => {
        expect(() => executeOperation(10, 'divide', 0)).toThrow(
          'Division by zero is not allowed'
        );
      });
    });
  });

  describe('computeResult', () => {
    test('should compute addition result', () => {
      const result = computeResult(15, 'add', 25);
      expect(result).toBe(40);
    });

    test('should compute subtraction result', () => {
      const result = computeResult(100, 'subtract', 30);
      expect(result).toBe(70);
    });

    test('should compute multiplication result', () => {
      const result = computeResult(7, 'multiply', 8);
      expect(result).toBe(56);
    });

    test('should compute division result', () => {
      const result = computeResult(20, 'divide', 4);
      expect(result).toBe(5);
    });
  });

  describe('validateOperation', () => {
    test('should validate addition operation', () => {
      const result = validateOperation('add', 5);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should validate subtraction operation', () => {
      const result = validateOperation('subtract', 10);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should validate multiplication operation', () => {
      const result = validateOperation('multiply', 3);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should validate division operation with non-zero divisor', () => {
      const result = validateOperation('divide', 5);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should reject division by zero', () => {
      const result = validateOperation('divide', 0);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Division by zero is not allowed');
    });

    test('should reject invalid operation type', () => {
      const result = validateOperation('invalid' as OperationType, 5);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid operation type');
    });
  });
});
