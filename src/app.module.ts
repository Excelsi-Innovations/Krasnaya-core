import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { AstModule } from './modules/ast/ast.module';
import { InterpreterModule } from './modules/interpreter/interpreter.module';
import { DrizzleModule } from './db/drizzle.module';
import { QueueModule } from './modules/queue/queue.module';
import { EventsModule } from './modules/events/events.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { ManagementModule } from './modules/management/management.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    DrizzleModule,
    AstModule,
    InterpreterModule,
    QueueModule,
    EventsModule,
    WebhookModule,
    ManagementModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
