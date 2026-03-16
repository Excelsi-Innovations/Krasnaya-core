import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { scripts } from './schema';

export const DRIZZLE_DB = 'DRIZZLE_DB';

export type DrizzleDb = NodePgDatabase<typeof import('./schema')>;

@Global()
@Module({
  imports: [ConfigModule], // Ensure ConfigService is available
  providers: [
    {
      provide: DRIZZLE_DB,
      useFactory: async (configService: ConfigService): Promise<DrizzleDb> => {
        const connectionString = configService.get<string>('DATABASE_URL');
        const pool = new Pool({ connectionString });
        return drizzle(pool, { schema: { scripts } });
      },
      inject: [ConfigService],
    },
  ],
  exports: [DRIZZLE_DB],
})
export class DrizzleModule {}
