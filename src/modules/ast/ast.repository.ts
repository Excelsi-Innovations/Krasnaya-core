import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_DB, DrizzleDb } from '../../db/drizzle.module';
import { eq, and } from 'drizzle-orm';
import { scripts, NewScript } from '../../db/schema';

@Injectable()
export class AstRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb) {}

  async create(script: NewScript) {
    return this.db.insert(scripts).values(script).returning();
  }

  async findByNameAndVersion(name: string, version: string) {
    return this.db
      .select()
      .from(scripts)
      .where(and(eq(scripts.name, name), eq(scripts.version, version)))
      .limit(1);
  }
}
