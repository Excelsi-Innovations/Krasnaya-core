import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { AdaptersModule } from '../adapters/adapters.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [AdaptersModule, QueueModule],
  controllers: [WebhookController],
  providers: [WebhookService],
  exports: [WebhookService],
})
export class WebhookModule {}
