import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AstService } from './ast.service';
import { InterpreterService } from '../interpreter/interpreter.service';

@Controller('ast')
export class AstController {
  constructor(
    private readonly astService: AstService,
    private readonly interpreterService: InterpreterService,
  ) {}

  @Post('validate')
  validate(@Body() ast: any) {
    return this.astService.validateAst(ast);
  }

  @Post('debug/execute')
  async debugExecute(@Body() body: { ast: any; context: any }) {
    // This is a mock execution - it doesn't send real messages
    // For now, we'll just validate the AST and return the context
    const validatedAst = this.astService.validateAst(body.ast);
    // In a real debugger, we would step through the AST and return the state
    return {
      status: 'debug_execution_complete',
      ast: validatedAst,
      context: body.context,
    };
  }
}
