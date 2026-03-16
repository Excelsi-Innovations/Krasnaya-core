import { Module } from '@nestjs/common';
import { ExpressionService } from './expression.service';

@Module({
  providers: [ExpressionService],
  exports: [ExpressionService],
})
export class ExpressionModule {}
