import { Injectable, BadRequestException } from '@nestjs/common';
import { AdapterFactory } from '../adapters/adapter.factory';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class WebhookService {
  constructor(
    private readonly adapterFactory: AdapterFactory,
    private readonly queueService: QueueService,
  ) {}

  /**
   * Processes an incoming webhook from a specific platform.
   * @param platform The platform identifier (e.g., 'telegram', 'discord')
   * @param payload The raw webhook payload
   */
  async processWebhook(platform: string, payload: any) {
    try {
      // 1. Get the appropriate adapter
      const adapter = this.adapterFactory.getAdapter(platform);

      // 2. Normalize the event to our unified format
      const normalizedEvent = adapter.normalizeEvent(payload);

      if (!normalizedEvent) {
        console.warn(`Webhook for ${platform} resulted in no normalized event.`);
        return; // Acknowledge but ignore (e.g., heartbeat, empty message)
      }

      // 3. Push to the queue for async processing
      await this.queueService.addMessage({
        platformEvent: normalizedEvent,
        // In a real app, we would determine which script to run based on the bot ID or chat ID
        scriptName: 'default', 
        scriptVersion: '1.0.0',
      });

      console.log(`Webhook processed for ${platform}: ${normalizedEvent.chatId}`);
    } catch (error) {
      console.error(`Error processing webhook for ${platform}:`, error);
      throw new BadRequestException('Failed to process webhook');
    }
  }
}
