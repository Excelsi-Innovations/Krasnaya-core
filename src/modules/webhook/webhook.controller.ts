import { Controller, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  /**
   * Generic webhook endpoint.
   * POST /webhook/:platform
   * Example: POST /webhook/telegram
   */
  @Post(':platform')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param('platform') platform: string,
    @Body() payload: any,
  ) {
    await this.webhookService.processWebhook(platform, payload);
    return { status: 'ok' };
  }

  /**
   * Specific endpoint for Telegram (optional, but good for clarity).
   * Telegram sends JSON payloads.
   */
  @Post('telegram')
  @HttpCode(HttpStatus.OK)
  async handleTelegramWebhook(@Body() payload: any) {
    await this.webhookService.processWebhook('telegram', payload);
    return { status: 'ok' };
  }

  /**
   * Specific endpoint for Discord (optional).
   * Discord sends payloads via interactions or gateway (simplified here for webhook receiver).
   */
  @Post('discord')
  @HttpCode(HttpStatus.OK)
  async handleDiscordWebhook(@Body() payload: any) {
    await this.webhookService.processWebhook('discord', payload);
    return { status: 'ok' };
  }
}
