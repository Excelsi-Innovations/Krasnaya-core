import { Injectable } from '@nestjs/common';
import { BotAdapter, SendMessageOptions } from '../../shared/interfaces/bot-adapter.interface';
import axios from 'axios';

@Injectable()
export class TelegramAdapter implements BotAdapter {
  private readonly apiUrl = 'https://api.telegram.org/bot';
  private readonly token: string;

  constructor() {
    // In a real app, this would come from ConfigService
    this.token = process.env.TELEGRAM_BOT_TOKEN || '';
  }

  async sendText(chatId: string, text: string): Promise<void> {
    await axios.post(`${this.apiUrl}${this.token}/sendMessage`, {
      chat_id: chatId,
      text: text,
    });
  }

  async sendMenu(chatId: string, text: string, buttons: Array<{ text: string; value: string }>): Promise<void> {
    // Telegram doesn't have native menus like Discord, we use inline keyboards
    const keyboard = {
      inline_keyboard: buttons.map(btn => [{ text: btn.text, callback_data: btn.value }]),
    };
    
    await axios.post(`${this.apiUrl}${this.token}/sendMessage`, {
      chat_id: chatId,
      text: text,
      reply_markup: keyboard,
    });
  }

  async sendMedia(chatId: string, url: string, caption?: string): Promise<void> {
    // Assuming photo for simplicity, could be video or document
    await axios.post(`${this.apiUrl}${this.token}/sendPhoto`, {
      chat_id: chatId,
      photo: url,
      caption: caption,
    });
  }

  normalizeEvent(rawEvent: any): any {
    // Extract message from Telegram webhook
    const message = rawEvent.message || rawEvent.callback_query?.message;
    if (!message) return null;

    return {
      platform: 'telegram',
      chatId: message.chat.id.toString(),
      text: message.text || rawEvent.callback_query?.data || '',
      userId: message.from.id.toString(),
      isButtonPress: !!rawEvent.callback_query,
      raw: rawEvent,
    };
  }
}
