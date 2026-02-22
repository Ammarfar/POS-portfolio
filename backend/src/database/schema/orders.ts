import { index, integer, pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { users } from './users';

export const orderStatusEnum = pgEnum('order_status', ['COMPLETED', 'CANCELLED']);
export const paymentMethodEnum = pgEnum('payment_method', ['CASH', 'CARD']);

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    cashierId: uuid('cashier_id')
      .notNull()
      .references(() => users.id),
    subtotal: integer('subtotal').notNull(),
    taxAmount: integer('tax_amount').notNull(),
    totalAmount: integer('total_amount').notNull(),
    paymentMethod: paymentMethodEnum('payment_method').notNull().default('CASH'),
    status: orderStatusEnum('status').notNull().default('COMPLETED'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('orders_tenant_created_idx').on(table.tenantId, table.createdAt),
  ],
);
