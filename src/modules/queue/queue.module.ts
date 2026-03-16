import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueService } from './queue.service';
import { MessageProcessor } from './message.processor';
import { InterpreterModule } from '../interpreter/interpreter.module';
import { AstModule } from '../ast/ast.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'incoming-messages',
    }),
    InterpreterModule,
    AstModule,
  ],
  providers: [QueueService, MessageProcessor],
  exports: [QueueService],
})
export class QueueModule {}
