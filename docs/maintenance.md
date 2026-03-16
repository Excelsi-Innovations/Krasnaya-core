# Maintenance Guide

## Database Migrations

We use Drizzle ORM for database management.

### Pushing Schema Changes
To update the database schema locally or in development:

```bash
npx drizzle-kit push
```

### Generating Migrations
For production environments, generate SQL migration files:

```bash
npx drizzle-kit generate
```

Then apply them using your deployment pipeline.

## Testing

### Unit Tests
Run the test suite:

```bash
npm run test
```

Run tests with coverage:

```bash
npm run test:cov
```

### Adding New Tests
Create `*.spec.ts` files alongside your implementation.
Use `jest` and `@nestjs/testing`.

Example (`ast.service.spec.ts`):
```typescript
describe('AstService', () => {
  it('should validate correct AST', () => {
    // ...
  });
});
```

## Code Quality

### Linting
The project uses TypeScript compiler (`tsc`) for type checking.

```bash
npm run build
```

### Formatting
Ensure consistent code style (Prettier is recommended but not强制).

## Deployment

### Build
Compile the TypeScript project:

```bash
npm run build
```

### Start
Run the compiled application:

```bash
node dist/main.js
```

### Docker
A basic `Dockerfile` can be added:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
CMD ["node", "dist/main.js"]
```

## Common Issues

### Redis Connection Errors
If the app fails to connect to Redis:
1.  Check if Redis is running: `redis-cli ping`
2.  Verify `REDIS_URL` in `.env`.
3.  Ensure firewall allows port 6379.

### Database Connection Errors
1.  Check PostgreSQL service status.
2.  Verify `DATABASE_URL` format: `postgres://user:pass@host:port/dbname`.
3.  Ensure migrations are applied.

### Discord Gateway Intents
If Discord bot doesn't receive messages:
1.  Enable "Message Content Intent" in the Discord Developer Portal.
2.  Verify intents in `DiscordAdapter` match required permissions.
