import { index, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    name: varchar('name', { length: 255 }).notNull(),
    icon: varchar('icon', { length: 10 }),
    color: varchar('color', { length: 50 }),
  },
  (table) => [index('categories_tenant_id_idx').on(table.tenantId)],
);
