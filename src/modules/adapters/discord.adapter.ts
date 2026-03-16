import { Injectable, OnModuleInit } from '@nestjs/common';
import { BotAdapter } from '../../shared/interfaces/bot-adapter.interface';
import { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, TextChannel, Interaction, Message } from 'discord.js';

@Injectable()
export class DiscordAdapter implements BotAdapter, OnModuleInit {
  private client: Client;
  private isReady = false;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.client.on('ready', () => {
      this.isReady = true;
      console.log(`Discord bot logged in as ${this.client.user.tag}`);
    });

    // Error handling to prevent crash
    this.client.on('error', (error) => {
      console.error('Discord client error:', error);
    });
    
    const token = process.env.DISCORD_BOT_TOKEN;
    if (token) {
      this.client.login(token).catch(err => console.error('Failed to login to Discord:', err));
    }
  }

  async onModuleInit() {
    // Ensure client is ready before accepting requests if token is present
    if (process.env.DISCORD_BOT_TOKEN && !this.isReady) {
      await new Promise(resolve => this.client.once('ready', resolve));
    }
  }

  async sendText(chatId: string, text: string): Promise<void> {
    if (!this.isReady) throw new Error('Discord client not ready');
    const channel = await this.client.channels.fetch(chatId);
    if (channel instanceof TextChannel) {
      await channel.send(text);
    } else {
      throw new Error(`Channel ${chatId} is not a text channel`);
    }
  }

  async sendMenu(chatId: string, text: string, buttons: Array<{ text: string; value: string }>): Promise<void> {
    if (!this.isReady) throw new Error('Discord client not ready');
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
    } else {
      throw new Error(`Channel ${chatId} is not a text channel`);
    }
  }

  async sendMedia(chatId: string, url: string, caption?: string): Promise<void> {
    if (!this.isReady) throw new Error('Discord client not ready');
    const channel = await this.client.channels.fetch(chatId);
    if (channel instanceof TextChannel) {
      const embed = new EmbedBuilder()
        .setImage(url)
        .setDescription(caption || '');
      
      await channel.send({ embeds: [embed] });
    } else {
      throw new Error(`Channel ${chatId} is not a text channel`);
    }
  }

  normalizeEvent(rawEvent: any): any {
    // Handle Discord Interaction (Slash Commands, Buttons) via Webhook or Gateway
    // Note: Discord interactions are often received via Gateway (ws) or Interactions Endpoint (Webhook)
    
    // Case 1: Interaction Object (Gateway or Webhook format)
    // We check for method existence to determine if it's a class instance
    if (rawEvent.isButton || rawEvent.isChatInputCommand) {
       // If it's a button interaction
       if (rawEvent.isButton && rawEvent.isButton()) {
         return {
           platform: 'discord',
           chatId: rawEvent.channelId,
           text: rawEvent.customId, // The button's custom ID is the "value"
           userId: rawEvent.user.id,
           isButtonPress: true,
           raw: rawEvent,
         };
       }
       
       // If it's a slash command
       if (rawEvent.isChatInputCommand && rawEvent.isChatInputCommand()) {
         return {
           platform: 'discord',
           chatId: rawEvent.channelId,
           text: rawEvent.options.getString('input') || rawEvent.commandName,
           userId: rawEvent.user.id,
           isCommand: true,
           raw: rawEvent,
         };
       }
    }

    // Case 2: Raw JSON payload from Webhook (rare, usually interactions are Objects)
    // This handles parsing a JSON body if sent directly
    if (rawEvent.type === 2) { // ApplicationCommand
       return {
         platform: 'discord',
         chatId: rawEvent.channel_id, // Note: webhook JSON uses snake_case
         text: rawEvent.data?.options?.find(o => o.name === 'input')?.value || rawEvent.data?.custom_id || '',
         userId: rawEvent.member?.user?.id || rawEvent.user?.id,
         isButtonPress: rawEvent.data?.custom_id !== undefined,
         raw: rawEvent,
       };
    }
    
    // Case 3: Standard Message Object (from Gateway)
    if (rawEvent.content && rawEvent.author) {
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
