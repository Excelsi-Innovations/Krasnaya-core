export interface SendMessageOptions {
  text?: string;
  mediaUrl?: string;
  caption?: string;
  buttons?: Array<{ text: string; value: string }>;
}

export interface BotAdapter {
  /**
   * Sends a text message to the user.
   */
  sendText(chatId: string, text: string): Promise<void>;

  /**
   * Sends a menu (interactive buttons) to the user.
   */
  sendMenu(chatId: string, text: string, buttons: Array<{ text: string; value: string }>): Promise<void>;

  /**
   * Sends media (image, video, etc.) to the user.
   */
  sendMedia(chatId: string, url: string, caption?: string): Promise<void>;

  /**
   * Normalizes incoming platform events to a unified format.
   * e.g., Telegram webhook -> UnifiedEvent
   */
  normalizeEvent(rawEvent: any): any; // Returns a UnifiedEvent
}
