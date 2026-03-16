# Adapters Documentation

Adapters are the bridge between the generic Krasnaya-Core execution engine and specific platform APIs.

## Architecture

Each adapter implements the `BotAdapter` interface defined in `src/shared/interfaces/bot-adapter.interface.ts`.

```typescript
interface BotAdapter {
  sendText(chatId: string, text: string): Promise<void>;
  sendMenu(chatId: string, text: string, buttons: Button[]): Promise<void>;
  sendMedia(chatId: string, url: string, caption?: string): Promise<void>;
  normalizeEvent(rawEvent: any): any;
}
```

## Available Adapters

### 1. Discord Adapter (`DiscordAdapter`)

**Library:** `discord.js`
**File:** `src/modules/adapters/discord.adapter.ts`

**Features:**
-   Connects to Discord via WebSocket Gateway (requires `DISCORD_BOT_TOKEN`).
-   Supports sending Text, Buttons (Menus), and Embeds (Media).
-   Normalizes incoming interactions (Slash Commands, Buttons) and messages.

**Configuration:**
-   **Intents:** `Guilds`, `GuildMessages`, `MessageContent`.
-   **Token:** `DISCORD_BOT_TOKEN` in `.env`.

**Event Normalization:**
The adapter converts Discord events into the unified format:
```typescript
{
  platform: 'discord',
  chatId: string,
  text: string, // Content or Button ID
  userId: string,
  isButtonPress: boolean,
  raw: any
}
```

**Usage in Webhook:**
Discord interactions can be received via the Gateway (WebSocket) or via an Interactions Endpoint (Webhook). This adapter supports both by checking the object structure.

### 2. Telegram Adapter (`TelegramAdapter`)

**Library:** `axios` (Direct HTTP API calls)
**File:** `src/modules/adapters/telegram.adapter.ts`

**Features:**
-   Stateless HTTP requests to Telegram Bot API.
-   Supports Inline Keyboards (as menus).
-   Supports Photo/Video sending.

**Configuration:**
-   **Token:** `TELEGRAM_BOT_TOKEN` in `.env`.

**Event Normalization:**
Normalizes Telegram webhook payloads (JSON) into the unified format.

## Implementing a New Adapter

To add a new platform (e.g., Slack, WhatsApp):

1.  **Create the Adapter Class:**
    Create `src/modules/adapters/{platform}.adapter.ts`.
    Implement the `BotAdapter` interface.

2.  **Update the Factory:**
    Modify `src/modules/adapters/adapter.factory.ts` to return your new adapter when the platform string matches.

    ```typescript
    // adapter.factory.ts
    switch (platform.toLowerCase()) {
      case 'slack':
        return this.slackAdapter;
      // ...
    }
    ```

3.  **Register the Module:**
    Ensure the new adapter is provided in `src/modules/adapters/adapters.module.ts`.

4.  **Update Webhook Controller:**
    The generic webhook endpoint `/webhook/:platform` will automatically route to your adapter via the factory.
