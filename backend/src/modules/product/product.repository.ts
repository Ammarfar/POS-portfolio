import { Inject, Injectable } from '@nestjs/common';
import { and, eq, ilike } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../../database/drizzle.provider';
import * as schema from '../../database/schema';

@Injectable()
export class ProductRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findAllByTenant(
    tenantId: string,
    filters?: { categoryId?: string; search?: string },
  ) {
    const conditions = [eq(schema.products.tenantId, tenantId)];

    if (filters?.categoryId) {
      conditions.push(eq(schema.products.categoryId, filters.categoryId));
    }

    if (filters?.search) {
      conditions.push(ilike(schema.products.name, `%${filters.search}%`));
    }

    return this.db
      .select({
        id: schema.products.id,
        name: schema.products.name,
        price: schema.products.price,
        image_url: schema.products.imageUrl,
        stock: schema.products.stock,
        category_id: schema.products.categoryId,
      })
      .from(schema.products)
      .where(and(...conditions));
  }

  async findById(id: string, tenantId: string) {
    const [product] = await this.db
      .select()
      .from(schema.products)
      .where(
        and(
          eq(schema.products.id, id),
          eq(schema.products.tenantId, tenantId),
        ),
      )
      .limit(1);
    return product ?? null;
  }

  async create(data: {
    tenantId: string;
    name: string;
    price: number;
    stock: number;
    categoryId?: string;
    imageUrl?: string;
  }) {
    const [product] = await this.db
      .insert(schema.products)
      .values(data)
      .returning();
    return product;
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<{
      name: string;
      price: number;
      stock: number;
      categoryId: string;
      imageUrl: string;
    }>,
  ) {
    const [product] = await this.db
      .update(schema.products)
      .set(data)
      .where(
        and(
          eq(schema.products.id, id),
          eq(schema.products.tenantId, tenantId),
        ),
      )
      .returning();
    return product ?? null;
  }

  async delete(id: string, tenantId: string) {
    const [product] = await this.db
      .delete(schema.products)
      .where(
        and(
          eq(schema.products.id, id),
          eq(schema.products.tenantId, tenantId),
        ),
      )
      .returning();
    return product ?? null;
  }
}
