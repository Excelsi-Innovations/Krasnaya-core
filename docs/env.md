# Environment Variables

Krasnaya-Core uses environment variables for configuration. Create a `.env` file in the root directory.

## Core Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` | Yes (for production) |
| `PORT` | HTTP Server port | `3000` | No |

## Platform Tokens

### Discord
| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_BOT_TOKEN` | Bot Token from Discord Developer Portal | Yes (if using Discord) |

### Telegram
| Variable | Description | Required |
|----------|-------------|----------|
| `TELEGRAM_BOT_TOKEN` | Bot Token from @BotFather | Yes (if using Telegram) |

## Example .env

```env
# Database
DATABASE_URL=postgres://user:password@localhost:5432/krasnaya

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=3000

# Discord
DISCORD_BOT_TOKEN=your_discord_bot_token

# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

## Security Notes

-   **Never commit `.env`** to version control. It is listed in `.gitignore`.
-   Use a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault) in production.
-   Ensure database and Redis require authentication in production environments.
