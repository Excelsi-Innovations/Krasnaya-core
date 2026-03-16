import { Injectable } from '@nestjs/common';
import { Node, UIOp, FlowOp, PrimitiveOp } from '../../shared/schemas/ast.schema';
import { ExpressionService } from './expression.service';
import { AdapterFactory } from '../adapters/adapter.factory';
import { AstService } from '../ast/ast.service';
import { RedisService } from '../redis/redis.service';

export interface ExecutionContext {
  userId: string;
  chatId: string;
  platform: string;
  variables: Record<string, any>;
  cursor: string[]; // Path to the current node: [index0, index1, ...] or node ID
}

@Injectable()
export class InterpreterService {
  constructor(
    private readonly expressionService: ExpressionService,
    private readonly adapterFactory: AdapterFactory,
    private readonly astService: AstService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Process a single step of the bot execution.
   * Loads context from Redis, executes one node, saves context back to Redis.
   */
  async processStep(
    ast: Node,
    contextKey: string,
    inputText?: string, // User input for prompts
  ): Promise<{ waiting: boolean; message?: string }> {
    // 1. Load context from Redis
    let context = await this.redisService.getObject<ExecutionContext>(contextKey);
    if (!context) {
      // Initialize new context if not found
      // This requires knowing platform, chatId, userId from the initial request
      // For now, we assume context is passed in or initialized elsewhere
      // In a real app, we might extract this from the initial webhook request
      // For now, throw an error or initialize a default one if key is empty
      if (!contextKey) {
         context = {
            userId: 'unknown',
            chatId: 'unknown',
            platform: 'unknown',
            variables: {},
            cursor: ['0']
         };
      } else {
         throw new Error('Context not found. Initialize first.');
      }
    }

    // 2. Find the node at the current cursor
    const nodeToExecute = this.getNodeByPath(ast, context.cursor);
    if (!nodeToExecute) {
      // End of execution
      await this.redisService.del(contextKey); // Cleanup
      return { waiting: false, message: 'Conversation ended.' };
    }

    // 3. Process the node
    // If it's a prompt and we have input, store it first
    if ('type' in nodeToExecute && nodeToExecute.type === 'prompt' && inputText) {
      const promptOp = nodeToExecute as UIOp & { type: 'prompt' };
      context.variables[promptOp.variable] = inputText;
      // Move cursor to next node (simplified: assume next in sequence)
      // For real implementation, need robust cursor advancement logic
      context.cursor = this.advanceCursor(context.cursor, ast);
    } else {
      const result = await this.executeNode(nodeToExecute, context);
      if (result.waiting) {
        // Save context and wait
        await this.redisService.setObject(contextKey, context);
        return { waiting: true };
      }
      // Advance cursor
      context.cursor = this.advanceCursor(context.cursor, ast);
    }

    // 4. Save updated context
    await this.redisService.setObject(contextKey, context);

    return { waiting: false };
  }

  /**
   * Initialize a new execution context.
   */
  async initializeContext(
    key: string,
    platform: string,
    chatId: string,
    userId: string,
  ): Promise<void> {
    const context: ExecutionContext = {
      userId,
      chatId,
      platform,
      variables: {},
      cursor: ['0'], // Start at root
    };
    await this.redisService.setObject(key, context);
  }

  /**
   * Traverses the AST to find the node at the given path.
   */
  private getNodeByPath(node: Node, path: string[]): Node | null {
    if (path.length === 0) return node;
    
    const [head, ...tail] = path;
    const index = parseInt(head);

    if ('nodes' in node && Array.isArray(node.nodes)) {
      // Sequence node
      if (index >= 0 && index < node.nodes.length) {
        return this.getNodeByPath(node.nodes[index], tail);
      }
    }
    
    if ('then' in node && Array.isArray(node.then)) {
      if (head === 'then') {
         const nextIndex = parseInt(tail[0]);
         if (nextIndex >= 0 && nextIndex < node.then.length) {
           return this.getNodeByPath(node.then[nextIndex], tail.slice(1));
         }
      }
      if (head === 'else' && node.else) {
         const nextIndex = parseInt(tail[0]);
         if (nextIndex >= 0 && nextIndex < node.else.length) {
           return this.getNodeByPath(node.else[nextIndex], tail.slice(1));
         }
      }
    }
    
    return null;
  }

  /**
   * Advances the cursor to the next node in the traversal.
   * This is a simplified implementation for linear sequences.
   */
  private advanceCursor(currentPath: string[], ast: Node): string[] {
    // Simplified logic: just increment the last index
    // Real implementation needs to handle branching and tree traversal
    if (currentPath.length === 0) return [];
    
    const newPath = [...currentPath];
    const lastIndex = newPath.length - 1;
    newPath[lastIndex] = (parseInt(newPath[lastIndex]) + 1).toString();
    
    // Check if the new index is valid in the parent node
    // If not, we might need to move up the tree (not implemented for brevity)
    
    return newPath;
  }

  private async executeNode(node: Node, context: ExecutionContext): Promise<{ waiting: boolean }> {
    if ('type' in node) {
      switch (node.type) {
        case 'say':
          const sayOp = node as UIOp & { type: 'say' };
          const adapter = this.adapterFactory.getAdapter(context.platform);
          const text = this.injectVariables(sayOp.text, context.variables);
          await adapter.sendText(context.chatId, text);
          break;
          
        case 'prompt':
          const promptOp = node as UIOp & { type: 'prompt' };
          const promptAdapter = this.adapterFactory.getAdapter(context.platform);
          const promptText = this.injectVariables(promptOp.text, context.variables);
          await promptAdapter.sendText(context.chatId, promptText);
          return { waiting: true };
          
        case 'media':
          const mediaOp = node as UIOp & { type: 'media' };
          const mediaAdapter = this.adapterFactory.getAdapter(context.platform);
          const caption = mediaOp.caption ? this.injectVariables(mediaOp.caption, context.variables) : undefined;
          await mediaAdapter.sendMedia(context.chatId, mediaOp.url, caption);
          break;
          
        case 'if':
          const ifOp = node as FlowOp & { type: 'if' };
          const conditionResult = this.expressionService.evaluateCondition(ifOp.condition, context.variables);
          const branch = conditionResult ? ifOp.then : ifOp.else;
          
          if (branch && branch.length > 0) {
            for (const branchNode of branch) {
               await this.executeNode(branchNode, context);
            }
          }
          break;
          
        case 'sequence':
          const seqOp = node as FlowOp & { type: 'sequence' };
          for (const subNode of seqOp.nodes) {
             await this.executeNode(subNode, context);
          }
          break;
          
        case 'wait_input':
          return { waiting: true };
          
        case 'sum':
        case 'eq':
        case 'gt':
          this.expressionService.evaluate(node as PrimitiveOp, context.variables);
          break;
      }
    }
    return { waiting: false };
  }

  private injectVariables(text: string, variables: Record<string, any>): string {
    return text.replace(/\{\{(.+?)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? String(variables[key]) : match;
    });
  }
}

