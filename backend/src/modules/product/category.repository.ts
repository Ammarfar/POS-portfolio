import { Inject, Injectable } from '@nestjs/common';
import { and, count, eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../../database/drizzle.provider';
import * as schema from '../../database/schema';

@Injectable()
export class CategoryRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findAllByTenant(tenantId: string) {
    const cats = await this.db
      .select({
        id: schema.categories.id,
        name: schema.categories.name,
        icon: schema.categories.icon,
        color: schema.categories.color,
      })
      .from(schema.categories)
      .where(eq(schema.categories.tenantId, tenantId));

    // Get product counts per category
    const productCounts = await this.db
      .select({
        categoryId: schema.products.categoryId,
        count: count(),
      })
      .from(schema.products)
      .where(eq(schema.products.tenantId, tenantId))
      .groupBy(schema.products.categoryId);

    const countMap = new Map(
      productCounts.map((pc) => [pc.categoryId, pc.count]),
    );

    return cats.map((cat) => ({
      ...cat,
      product_count: countMap.get(cat.id) ?? 0,
    }));
  }

  async findById(id: string, tenantId: string) {
    const [cat] = await this.db
      .select()
      .from(schema.categories)
      .where(
        and(eq(schema.categories.id, id), eq(schema.categories.tenantId, tenantId)),
      )
      .limit(1);
    return cat ?? null;
  }
}
