import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { InterpreterService } from '../interpreter/interpreter.service';
import { AstService } from '../ast/ast.service';

@Processor('incoming-messages')
export class MessageProcessor {
  constructor(
    private readonly interpreterService: InterpreterService,
    private readonly astService: AstService,
  ) {}

  @Process('process-message')
  async handleJob(job: Job) {
    const { platformEvent, scriptName, scriptVersion } = job.data;
    
    // 1. Load AST from DB (or cache)
    // For simplicity, we'll assume the AST is passed or fetched here
    // In a real app, we'd fetch it using AstService and AstRepository
    
    // 2. Initialize or load context
    const contextKey = `user:context:${platformEvent.platform}:${platformEvent.chatId}`;
    
    // 3. Process the step
    // This is a simplified flow. In reality, we need to handle the full AST traversal.
    
    // For now, we'll just log the event
    console.log(`Processing message from ${platformEvent.chatId}: ${platformEvent.text}`);
    
    // Example: If we had the AST
    // await this.interpreterService.processStep(ast, contextKey, platformEvent.text);
  }
}
