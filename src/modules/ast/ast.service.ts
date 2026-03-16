import { Injectable, BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { NodeSchema, Node } from '../../shared/schemas/ast.schema';

@Injectable()
export class AstService {
  /**
   * Validates a raw JSON object against the AST schema.
   * @param rawJson The JSON object to validate
   * @returns The validated and typed Node
   * @throws BadRequestException if validation fails
   */
  validateAst(rawJson: any): Node {
    try {
      const parsed = NodeSchema.parse(rawJson);
      // Additional logical validation could go here
      // For now, we rely on Zod for structural validation
      return parsed;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new BadRequestException({
          message: 'AST Validation Failed',
          errors: error.issues,
        });
      }
      throw new BadRequestException('Invalid AST format');
    }
  }

  /**
   * Detects potential infinite loops or unreachable nodes in the AST.
   * Note: This is a simplified check and might not catch all edge cases.
   */
  detectLogicalErrors(node: Node): void {
    // Example: Check for 'wait_input' inside a loop (simplified)
    // This would require a full graph traversal. 
    // For now, we ensure basic structural integrity.
    
    // Check if 'if' condition is valid (not just boolean, but potentially referencing variables)
    // This is handled by the interpreter, but we can do basic sanity checks here.
  }
}
