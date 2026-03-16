import { Injectable } from '@nestjs/common';
import { PrimitiveOp } from '../../shared/schemas/ast.schema';

@Injectable()
export class ExpressionService {
  /**
   * Resolves a value which might be a literal or a variable reference.
   */
  private resolveValue(value: any, context: Record<string, any>): any {
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      const key = value.slice(2, -2).trim();
      return context[key];
    }
    return value;
  }

  /**
   * Evaluates a PrimitiveOp expression.
   * @param op The operation to evaluate
   * @param context The current context (variables)
   * @returns The result of the operation (and updates context if target is set)
   */
  evaluate(op: PrimitiveOp, context: Record<string, any>): any {
    const left = this.resolveValue(op.left, context);
    const right = this.resolveValue(op.right, context);
    
    let result: any;
    switch (op.type) {
      case 'sum':
        result = Number(left) + Number(right);
        break;
      case 'eq':
        result = left === right;
        break;
      case 'gt':
        result = Number(left) > Number(right);
        break;
      default:
        throw new Error(`Unknown primitive operation: ${(op as any).type}`);
    }

    if (op.target) {
      context[op.target] = result;
    }

    return result;
  }

  /**
   * Evaluates a generic condition (could be a PrimitiveOp or a boolean literal)
   */
  evaluateCondition(condition: any, context: Record<string, any>): boolean {
    if (typeof condition === 'boolean') {
      return condition;
    }
    
    // Check if it's a PrimitiveOp structure
    if (condition && typeof condition === 'object' && condition.type) {
      return this.evaluate(condition, context);
    }

    // If it's a string, treat it as a variable lookup (simple implementation)
    if (typeof condition === 'string') {
      return !!context[condition];
    }

    throw new Error('Invalid condition format');
  }
}
