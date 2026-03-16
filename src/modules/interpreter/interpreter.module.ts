import { Module, forwardRef } from '@nestjs/common';
import { InterpreterService } from './interpreter.service';
import { ExpressionModule } from './expression.module';
import { AdaptersModule } from '../adapters/adapters.module';
import { AstModule } from '../ast/ast.module';
import { RedisModule, REDIS_CLIENT } from '../redis/redis.module';
import { RedisService } from '../redis/redis.service';

@Module({
  imports: [ExpressionModule, AdaptersModule, forwardRef(() => AstModule), RedisModule],
  providers: [
    InterpreterService,
    RedisService, // Provide RedisService here instead of RedisModule
  ],
  exports: [InterpreterService, RedisService],
})
export class InterpreterModule {}
