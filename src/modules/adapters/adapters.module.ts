import { Module } from '@nestjs/common';
import { TelegramAdapter } from './telegram.adapter';
import { DiscordAdapter } from './discord.adapter';
import { AdapterFactory } from './adapter.factory';

@Module({
  providers: [TelegramAdapter, DiscordAdapter, AdapterFactory],
  exports: [AdapterFactory, TelegramAdapter, DiscordAdapter],
})
export class AdaptersModule {}
