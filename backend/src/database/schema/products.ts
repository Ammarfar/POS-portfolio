import { index, integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { categories } from './categories';
import { tenants } from './tenants';

export const products = pgTable(
  'products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    name: varchar('name', { length: 255 }).notNull(),
    price: integer('price').notNull(),
    stock: integer('stock').notNull().default(0),
    categoryId: uuid('category_id').references(() => categories.id),
    imageUrl: varchar('image_url', { length: 500 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('products_tenant_id_idx').on(table.tenantId),
    index('products_tenant_name_idx').on(table.tenantId, table.name),
  ],
);
