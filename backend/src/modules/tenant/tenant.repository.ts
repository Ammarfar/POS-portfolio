import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../../database/drizzle.provider';
import * as schema from '../../database/schema';

@Injectable()
export class TenantRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findById(id: string) {
    const [tenant] = await this.db
      .select()
      .from(schema.tenants)
      .where(eq(schema.tenants.id, id))
      .limit(1);
    return tenant ?? null;
  }

  async create(name: string) {
    const [tenant] = await this.db
      .insert(schema.tenants)
      .values({ name })
      .returning();
    return tenant;
  }
}
