import { Injectable } from '@nestjs/common';
import { BotAdapter } from '../../shared/interfaces/bot-adapter.interface';
import { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, TextChannel } from 'discord.js';

@Injectable()
export class DiscordAdapter implements BotAdapter {
  private client: Client;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
    
    const token = process.env.DISCORD_BOT_TOKEN;
    if (token) {
      this.client.login(token);
    }
  }

  async sendText(chatId: string, text: string): Promise<void> {
    const channel = await this.client.channels.fetch(chatId);
    if (channel instanceof TextChannel) {
      await channel.send(text);
    }
  }

  async sendMenu(chatId: string, text: string, buttons: Array<{ text: string; value: string }>): Promise<void> {
    const channel = await this.client.channels.fetch(chatId);
    if (channel instanceof TextChannel) {
      const row = new ActionRowBuilder<ButtonBuilder>();
      buttons.forEach(btn => {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(btn.value)
            .setLabel(btn.text)
            .setStyle(ButtonStyle.Primary),
        );
      });

      await channel.send({
        content: text,
        components: [row],
      });
    }
  }

  async sendMedia(chatId: string, url: string, caption?: string): Promise<void> {
    const channel = await this.client.channels.fetch(chatId);
    if (channel instanceof TextChannel) {
      const embed = new EmbedBuilder()
        .setImage(url)
        .setDescription(caption || '');
      
      await channel.send({ embeds: [embed] });
    }
  }

  normalizeEvent(rawEvent: any): any {
    // Discord events come from ws, but for webhooks we handle interactionCreate
    // This is a simplified version assuming rawEvent is a Discord Interaction
    // In a real NestJS Discord bot, we'd listen to events via ws or webhook
    
    if (rawEvent.type === 2) { // ApplicationCommand (Slash command) or Button Interaction
       return {
         platform: 'discord',
         chatId: rawEvent.channelId,
         text: rawEvent.options?.getString('input') || rawEvent.customId || '',
         userId: rawEvent.user.id,
         isButtonPress: rawEvent.isButton(),
         raw: rawEvent,
       };
    }
    
    // Handle regular messages
    if (rawEvent.content) {
      return {
        platform: 'discord',
        chatId: rawEvent.channelId,
        text: rawEvent.content,
        userId: rawEvent.author.id,
        raw: rawEvent,
      };
    }

    return null;
  }
}
