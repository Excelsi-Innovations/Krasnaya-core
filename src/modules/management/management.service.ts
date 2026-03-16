import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE_DB, DrizzleDb } from '../../db/drizzle.module';
import { scripts, executionLogs, Script, ExecutionLog } from '../../db/schema';
import { CreateScriptDto, UpdateScriptDto, ExecuteCommandDto } from './dto/script.dto';
import { InterpreterService } from '../interpreter/interpreter.service';
import { AstService } from '../ast/ast.service';

@Injectable()
export class ManagementService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: DrizzleDb,
    private readonly interpreterService: InterpreterService,
    private readonly astService: AstService,
  ) {}

  // === Script Management ===

  async createScript(createDto: CreateScriptDto): Promise<Script> {
    // Validate AST before saving
    this.astService.validateAst(createDto.ast);

    const [newScript] = await this.db
      .insert(scripts)
      .values({
        name: createDto.name,
        description: createDto.description,
        version: createDto.version,
        ast: createDto.ast,
        isActive: createDto.isActive ?? true,
        metadata: createDto.metadata ?? {},
      })
      .returning();
    
    return newScript;
  }

  async findAllScripts(): Promise<Script[]> {
    return await this.db.select().from(scripts);
  }

  async findScriptById(id: number): Promise<Script | undefined> {
    const result = await this.db.select().from(scripts).where(eq(scripts.id, id));
    return result[0];
  }

  async updateScript(id: number, updateDto: UpdateScriptDto): Promise<Script> {
    const existingScript = await this.findScriptById(id);
    if (!existingScript) {
      throw new NotFoundException(`Script with ID ${id} not found`);
    }

    if (updateDto.ast) {
      this.astService.validateAst(updateDto.ast);
    }

    const [updatedScript] = await this.db
      .update(scripts)
      .set({
        ...updateDto,
        updatedAt: new Date(),
      })
      .where(eq(scripts.id, id))
      .returning();
    
    return updatedScript;
  }

  async deleteScript(id: number): Promise<void> {
    const existingScript = await this.findScriptById(id);
    if (!existingScript) {
      throw new NotFoundException(`Script with ID ${id} not found`);
    }

    await this.db.delete(scripts).where(eq(scripts.id, id));
  }

  // === Execution Management ===

  async executeCommand(executeDto: ExecuteCommandDto): Promise<ExecutionLog> {
    const script = await this.findScriptById(Number(executeDto.scriptId));
    if (!script) {
      throw new NotFoundException(`Script with ID ${executeDto.scriptId} not found`);
    }

    if (!script.isActive) {
      throw new NotFoundException(`Script with ID ${executeDto.scriptId} is not active`);
    }

    const startTime = Date.now();
    let status: 'success' | 'error' = 'success';
    let output = '';
    let errorMessage = '';

    try {
      // Create a mock context for manual execution
      const context = {
        userId: executeDto.userId || 'manual-execution',
        chatId: executeDto.chatId,
        platform: executeDto.platform,
        variables: executeDto.context || {},
        cursor: ['0'],
      };

      // Execute the script synchronously for manual commands
      // Note: In production, you might want to use the queue for this
      const result = await this.interpreterService.processStep(
        script.ast,
        `manual:${executeDto.platform}:${executeDto.chatId}`,
        undefined, // No input text for initial execution
      );

      output = result.message || 'Execution completed';
    } catch (error) {
      status = 'error';
      errorMessage = error.message;
      output = error.stack;
    }

    const executionTime = Date.now() - startTime;

    const [log] = await this.db
      .insert(executionLogs)
      .values({
        scriptId: script.id,
        platform: executeDto.platform,
        chatId: executeDto.chatId,
        userId: executeDto.userId,
        input: JSON.stringify(executeDto.context),
        output,
        status,
        errorMessage,
        executionTime,
      })
      .returning();

    return log;
  }

  async getExecutionLogs(
    scriptId?: number,
    limit = 50,
    offset = 0,
  ): Promise<ExecutionLog[]> {
    if (scriptId) {
      return await this.db
        .select()
        .from(executionLogs)
        .where(eq(executionLogs.scriptId, scriptId))
        .orderBy(executionLogs.createdAt)
        .limit(limit)
        .offset(offset);
    }
    
    return await this.db
      .select()
      .from(executionLogs)
      .orderBy(executionLogs.createdAt)
      .limit(limit)
      .offset(offset);
  }

  async getExecutionLogById(id: number): Promise<ExecutionLog | undefined> {
    const result = await this.db
      .select()
      .from(executionLogs)
      .where(eq(executionLogs.id, id));
    return result[0];
  }

  // === Dashboard Statistics ===

  async getDashboardStats() {
    // Note: Drizzle aggregation might need different syntax
    // For now, return basic counts
    const allScripts = await this.db.select().from(scripts);
    const allLogs = await this.db.select().from(executionLogs);
    
    const activeScripts = allScripts.filter(s => s.isActive);
    const failedExecutions = allLogs.filter(l => l.status === 'error');

    return {
      totalScripts: allScripts.length,
      activeScripts: activeScripts.length,
      totalExecutions: allLogs.length,
      failedExecutions: failedExecutions.length,
      successRate: allLogs.length > 0 
        ? ((allLogs.length - failedExecutions.length) / allLogs.length * 100).toFixed(2)
        : '0.00',
    };
  }
}