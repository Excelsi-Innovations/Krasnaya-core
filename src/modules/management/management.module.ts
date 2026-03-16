import { Module } from '@nestjs/common';
import { ManagementService } from './management.service';
import { ScriptController } from './script.controller';
import { ExecutionController } from './execution.controller';
import { InterpreterModule } from '../interpreter/interpreter.module';
import { AstModule } from '../ast/ast.module';

@Module({
  imports: [InterpreterModule, AstModule],
  controllers: [ScriptController, ExecutionController],
  providers: [ManagementService],
  exports: [ManagementService],
})
export class ManagementModule {}
