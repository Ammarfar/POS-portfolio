import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../../database/drizzle.provider';
import * as schema from '../../database/schema';
import type { CreateOrderDto } from './dto/create-order.dto';
import { OrderRepository } from './order.repository';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async createOrder(tenantId: string, cashierId: string, dto: CreateOrderDto) {
    let subtotal = 0;

    // Validate stock availability before attempting the order
    for (const item of dto.items) {
      const [product] = await this.db
        .select({ id: schema.products.id, stock: schema.products.stock, name: schema.products.name, price: schema.products.price })
        .from(schema.products)
        .where(
          and(
            eq(schema.products.id, item.product_id),
            eq(schema.products.tenantId, tenantId),
          ),
        )
        .limit(1);

      if (!product) {
        throw new BadRequestException({
          code: 'PRODUCT_NOT_FOUND',
          message: `Product ${item.product_id} not found`,
        });
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException({
          code: 'INSUFFICIENT_STOCK',
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        });
      }

      subtotal += product.price * item.quantity;
      item.price_at_time = product.price;
    }

    const taxAmount = subtotal * 0.08;
    const totalAmount = subtotal + taxAmount;

    return this.orderRepository.create({
      tenantId,
      cashierId,
      subtotal,
      taxAmount,
      totalAmount,
      paymentMethod: dto.payment_method,
      items: dto.items.map((item) => ({
        productId: item.product_id,
        quantity: item.quantity,
        priceAtTime: item.price_at_time,
      })),
    });
  }

  async findRecent(tenantId: string, limit: number = 10) {
    return this.orderRepository.findRecentByTenant(tenantId, limit);
  }
}
