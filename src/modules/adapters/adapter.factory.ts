import { Injectable, Inject } from '@nestjs/common';
import { BotAdapter } from '../../shared/interfaces/bot-adapter.interface';
import { TelegramAdapter } from './telegram.adapter';
import { DiscordAdapter } from './discord.adapter';

@Injectable()
export class AdapterFactory {
  constructor(
    private readonly telegramAdapter: TelegramAdapter,
    private readonly discordAdapter: DiscordAdapter,
  ) {}

  getAdapter(platform: string): BotAdapter {
    switch (platform.toLowerCase()) {
      case 'telegram':
        return this.telegramAdapter;
      case 'discord':
        return this.discordAdapter;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
}
