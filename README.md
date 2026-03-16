# Krasnaya-Core: The Unified Bot Intelligence Layer

**Krasnaya-Core** is a universal interpreter for bot logic, designed to decouple intelligence from interface. It allows developers to define bot behavior using a JSON-based AST (Abstract Syntax Tree) and execute it across multiple platforms (Telegram, Discord, Slack, etc.) without rewriting business logic.

## 🏗️ Architecture Overview

The system is built on a modular NestJS architecture, separating concerns into distinct layers:

1.  **AST Layer (`src/modules/ast`)**: Handles the definition, validation, and storage of bot scripts.
2.  **Interpreter Layer (`src/modules/interpreter`)**: The core engine that evaluates the AST, manages state, and injects variables.
3.  **Adapter Layer (`src/modules/adapters`)**: Translates generic UI operations into platform-specific API calls.
4.  **Ingestion Layer (`src/modules/webhook`, `src/modules/queue`)**: Handles incoming events via Webhooks and processes them asynchronously using BullMQ.
5.  **Persistence Layer (`src/db`)**: Uses Drizzle ORM with PostgreSQL for script storage and Redis for context caching.

---

## 🚀 Getting Started

### Prerequisites

-   Node.js (v18+)
-   PostgreSQL (for script storage)
-   Redis (for queue and context caching)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd krasnaya-core
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory:
    ```env
    # Database
    DATABASE_URL=postgres://user:password@localhost:5432/krasnaya

    # Redis
    REDIS_URL=redis://localhost:6379

    # Platform Tokens (Optional)
    TELEGRAM_BOT_TOKEN=your_telegram_token
    DISCORD_BOT_TOKEN=your_discord_token
    ```

4.  **Run Database Migrations:**
    ```bash
    npx drizzle-kit push
    ```

5.  **Start the Application:**
    ```bash
    npm run start:dev
    ```

---

## 📖 Usage

### 1. Defining a Bot Script (AST)

Bot logic is defined in JSON format. Here is a simple example:

```json
{
  "type": "sequence",
  "nodes": [
    {
      "type": "say",
      "text": "Hello! Welcome to Krasnaya-Core."
    },
    {
      "type": "prompt",
      "text": "What is your name?",
      "variable": "userName"
    },
    {
      "type": "say",
      "text": "Nice to meet you, {{userName}}!"
    }
  ]
}
```

### 2. Validating Scripts

You can validate your AST using the built-in validator:

```typescript
// Example usage in code
const ast = { /* your json */ };
const validated = astService.validateAst(ast);
```

Or via the API endpoint:
`POST /ast/validate`

### 3. Webhook Integration

Configure your platform (Telegram, Discord) to send updates to your server.

**Telegram Webhook URL:**
`https://your-domain.com/webhook/telegram`

**Discord Webhook URL:**
`https://your-domain.com/webhook/discord`

The system automatically normalizes these events and pushes them to the processing queue.

### 4. Adapters

Adapters translate generic operations into platform-specific actions.

*   **TelegramAdapter**: Uses `axios` to call Telegram Bot API.
*   **DiscordAdapter**: Uses `discord.js` to send messages and embeds.

### 5. Persistence

*   **Scripts**: Stored in PostgreSQL using Drizzle ORM (`scripts` table).
*   **Context**: Cached in Redis (`user:context:{platform}:{chatId}`) for fast access and stateless scalability.

---

## 🧪 Testing

Run the test suite:

```bash
npm run test
```

Run tests with coverage:

```bash
npm run test:cov
```

---

## 📂 Project Structure

```
src/
├── modules/
│   ├── ast/                # AST validation, storage, and controller
│   ├── interpreter/        # Core execution engine
│   ├── adapters/           # Platform-specific implementations
│   ├── webhook/            # Webhook ingestion endpoints
│   ├── queue/              # BullMQ producers/consumers
│   ├── events/             # SSE/WebSocket monitoring
│   └── redis/              # Redis service wrapper
├── shared/
│   ├── schemas/            # Zod schemas for AST
│   └── interfaces/         # TypeScript interfaces
├── db/
│   ├── schema.ts           # Drizzle ORM schema
│   └── drizzle.module.ts   # Database module
└── main.ts                 # Application entry point
```

---

## 🔧 API Reference

### Webhook Endpoints

-   **POST** `/webhook/:platform`
    -   Receives webhook events from platforms.
    -   Parameters: `platform` (e.g., `telegram`, `discord`)
    -   Body: Raw platform payload

### AST Endpoints

-   **POST** `/ast/validate`
    -   Validates an AST JSON payload.
    -   Body: AST JSON object

-   **POST** `/ast/debug/execute`
    -   Simulates AST execution (mock mode).
    -   Body: `{ "ast": AST_JSON, "context": {} }`

### Authentication Endpoints

-   **POST** `/auth/register`
    -   Register a new user.
    -   Body: `{ username, password }`

-   **POST** `/auth/login`
    -   Login and get JWT token.
    -   Body: `{ username, password }`

### Management API Endpoints

*Note: All management endpoints require JWT authentication via Bearer token.*

#### Script Management (CRUD)

-   **POST** `/management/scripts`
    -   Create a new script (requires auth).
    -   Body: `{ name, description, version, ast, isActive, metadata }`

-   **GET** `/management/scripts`
    -   List all scripts.

-   **GET** `/management/scripts/:id`
    -   Get a specific script by ID.

-   **PUT** `/management/scripts/:id`
    -   Update a script.
    -   Body: `{ name, description, version, ast, isActive, metadata }`

-   **DELETE** `/management/scripts/:id`
    -   Delete a script.

#### Execution Management

-   **POST** `/management/execution/execute`
    -   Execute a script manually.
    -   Body: `{ scriptId, platform, chatId, userId?, context? }`

-   **GET** `/management/execution/logs`
    -   Get execution logs.
    -   Query: `scriptId`, `limit`, `offset`

-   **GET** `/management/execution/logs/:id`
    -   Get a specific execution log.

-   **GET** `/management/execution/stats`
    -   Get dashboard statistics.

---

## 📚 Documentation

-   **[Adapters](docs/adapters.md)**: Guide on platform adapters (Discord, Telegram) and creating new ones.
-   **[Environment Variables](docs/env.md)**: Configuration and `.env` setup.
-   **[Maintenance](docs/maintenance.md)**: Database migrations, testing, and deployment.

## 🤖 LLMs.txt

A specialized `llms.txt` file is provided to help AI agents understand the codebase structure and patterns. See `llms.txt` in the root directory.
