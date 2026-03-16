import { Module, forwardRef } from '@nestjs/common';
import { AstService } from './ast.service';
import { AstRepository } from './ast.repository';
import { AstController } from './ast.controller';
import { InterpreterModule } from '../interpreter/interpreter.module';

@Module({
  imports: [forwardRef(() => InterpreterModule)],
  controllers: [AstController],
  providers: [AstService, AstRepository],
  exports: [AstService, AstRepository],
})
export class AstModule {}
