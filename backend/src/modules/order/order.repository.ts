import { Inject, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../../database/drizzle.provider';
import * as schema from '../../database/schema';

@Injectable()
export class OrderRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(
    data: {
      tenantId: string;
      cashierId: string;
      subtotal: number;
      taxAmount: number;
      totalAmount: number;
      paymentMethod: 'CASH' | 'CARD';
      items: { productId: string; quantity: number; priceAtTime: number }[];
    },
    tx?: any,
  ) {
    const execute = async (db: any) => {
      // 1. Create the order
      const [order] = await db
        .insert(schema.orders)
        .values({
          tenantId: data.tenantId,
          cashierId: data.cashierId,
          subtotal: data.subtotal,
          taxAmount: data.taxAmount,
          totalAmount: data.totalAmount,
          paymentMethod: data.paymentMethod,
          status: 'COMPLETED',
        })
        .returning();

      // 2. Create order items
      await db.insert(schema.orderItems).values(
        data.items.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtTime: item.priceAtTime,
        })),
      );

      return order;
    };

    if (tx) {
      return execute(tx);
    }

    return this.db.transaction(async (newTx) => {
      return execute(newTx);
    });
  }

  async findRecentByTenant(tenantId: string, limit: number = 10) {
    return this.db
      .select({
        id: schema.orders.id,
        status: schema.orders.status,
        created_at: schema.orders.createdAt,
        total_amount: schema.orders.totalAmount,
        subtotal: schema.orders.subtotal,
        tax_amount: schema.orders.taxAmount,
        payment_method: schema.orders.paymentMethod,
      })
      .from(schema.orders)
      .where(eq(schema.orders.tenantId, tenantId))
      .orderBy(desc(schema.orders.createdAt))
      .limit(limit);
  }
}
