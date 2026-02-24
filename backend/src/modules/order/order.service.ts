import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../../database/drizzle.provider';
import * as schema from '../../database/schema';
import { ProductService } from '../product/product.service';
import type { CreateOrderDto } from './dto/create-order.dto';
import { OrderRepository } from './order.repository';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productService: ProductService,
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async createOrder(tenantId: string, cashierId: string, dto: CreateOrderDto) {
    let subtotal = 0;

    // 1. Pre-validation and accumulation
    const productsToDeduct: { id: string; quantity: number }[] = [];
    for (const item of dto.items) {
      const product = await this.productService.findById(item.product_id, tenantId);

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
      productsToDeduct.push({ id: item.product_id, quantity: item.quantity });
    }

    const taxAmount = subtotal * 0.08;
    const totalAmount = subtotal + taxAmount;

    // 2. Transactional Execution
    return this.db.transaction(async (tx) => {
      // Deduct stock via ProductService
      for (const p of productsToDeduct) {
        await this.productService.deductStock(p.id, tenantId, p.quantity, tx);
      }

      // Create order via OrderRepository
      return this.orderRepository.create(
        {
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
        },
        tx,
      );
    });
  }

  async findRecent(tenantId: string, limit: number = 10) {
    return this.orderRepository.findRecentByTenant(tenantId, limit);
  }
}
