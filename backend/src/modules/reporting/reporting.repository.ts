import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, gte, ilike, lte, or, sql, sum } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../../database/drizzle.provider';
import * as schema from '../../database/schema';

@Injectable()
export class ReportingRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async getDashboardSummary(tenantId: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Today's orders
    const todayOrders = await this.db
      .select({
        totalRevenue: sum(schema.orders.totalAmount),
        orderCount: count(),
      })
      .from(schema.orders)
      .where(
        and(
          eq(schema.orders.tenantId, tenantId),
          gte(schema.orders.createdAt, startOfDay),
          eq(schema.orders.status, 'COMPLETED'),
        ),
      );

    const todayRevenue = Number(todayOrders[0]?.totalRevenue ?? 0);
    const ordersToday = Number(todayOrders[0]?.orderCount ?? 0);
    const avgOrderValue = ordersToday > 0 ? Math.round(todayRevenue / ordersToday) : 0;

    // Low stock count (products with stock < 10)
    const lowStockResult = await this.db
      .select({ count: count() })
      .from(schema.products)
      .where(
        and(
          eq(schema.products.tenantId, tenantId),
          lte(schema.products.stock, 10),
        ),
      );

    return {
      today_revenue: todayRevenue,
      orders_today: ordersToday,
      average_order_value: avgOrderValue,
      low_stock_count: Number(lowStockResult[0]?.count ?? 0),
    };
  }

  async getTopProducts(tenantId: string) {
    const results = await this.db
      .select({
        product_name: schema.products.name,
        sales_count: sum(schema.orderItems.quantity),
        total_revenue: sum(
          sql`${schema.orderItems.quantity} * ${schema.orderItems.priceAtTime}`,
        ),
      })
      .from(schema.orderItems)
      .innerJoin(schema.orders, eq(schema.orderItems.orderId, schema.orders.id))
      .innerJoin(schema.products, eq(schema.orderItems.productId, schema.products.id))
      .where(
        and(
          eq(schema.orders.tenantId, tenantId),
          eq(schema.orders.status, 'COMPLETED'),
        ),
      )
      .groupBy(schema.products.name)
      .orderBy(desc(sum(schema.orderItems.quantity)))
      .limit(10);

    return results.map((r) => ({
      product_name: r.product_name,
      sales_count: Number(r.sales_count ?? 0),
      total_revenue: Number(r.total_revenue ?? 0),
    }));
  }

  async getSalesReport(
    tenantId: string,
    options: {
      dateRange?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const offset = (page - 1) * limit;

    // Build date filter
    const now = new Date();
    let startDate: Date | undefined;

    switch (options.dateRange) {
      case '7D':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30D':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'YTD':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'today':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
    }

    const conditions = [
      eq(schema.orders.tenantId, tenantId),
    ];

    if (startDate) {
      conditions.push(gte(schema.orders.createdAt, startDate));
    }

    // Search by order ID or cashier name
    if (options.search) {
      conditions.push(
        or(
          sql`CAST(${schema.orders.id} AS TEXT) ILIKE ${`%${options.search}%`}`,
          ilike(schema.users.email, `%${options.search}%`),
        )!,
      );
    }

    // Get total count
    const countResult = await this.db
      .select({ count: count() })
      .from(schema.orders)
      .leftJoin(schema.users, eq(schema.orders.cashierId, schema.users.id))
      .where(and(...conditions));

    const totalResults = Number(countResult[0]?.count ?? 0);

    // Get paginated data with item counts
    const data = await this.db
      .select({
        order_id: schema.orders.id,
        date_time: schema.orders.createdAt,
        cashier_name: schema.users.email,
        total_amount: schema.orders.totalAmount,
        status: schema.orders.status,
      })
      .from(schema.orders)
      .leftJoin(schema.users, eq(schema.orders.cashierId, schema.users.id))
      .where(and(...conditions))
      .orderBy(desc(schema.orders.createdAt))
      .limit(limit)
      .offset(offset);

    // Get item counts per order
    const orderIds = data.map((d) => d.order_id);
    let itemCounts: Map<string, number> = new Map();

    if (orderIds.length > 0) {
      const itemCountResults = await this.db
        .select({
          orderId: schema.orderItems.orderId,
          totalItems: sum(schema.orderItems.quantity),
        })
        .from(schema.orderItems)
        .where(
          sql`${schema.orderItems.orderId} IN ${orderIds}`,
        )
        .groupBy(schema.orderItems.orderId);

      itemCounts = new Map(
        itemCountResults.map((r) => [r.orderId, Number(r.totalItems ?? 0)]),
      );
    }

    return {
      data: data.map((d) => ({
        order_id: d.order_id,
        date_time: d.date_time,
        cashier_name: d.cashier_name ?? 'Unknown',
        total_items: itemCounts.get(d.order_id) ?? 0,
        total_amount: d.total_amount,
        status: d.status,
      })),
      meta: {
        total_results: totalResults,
        page,
        limit,
      },
    };
  }
}
