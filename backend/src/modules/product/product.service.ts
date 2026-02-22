import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateProductDto } from './dto/create-product.dto';
import type { UpdateProductDto } from './dto/update-product.dto';
import { ProductRepository } from './product.repository';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async findAll(
    tenantId: string,
    filters?: { categoryId?: string; search?: string },
  ) {
    return this.productRepository.findAllByTenant(tenantId, filters);
  }

  async create(tenantId: string, dto: CreateProductDto) {
    return this.productRepository.create({
      tenantId,
      name: dto.name,
      price: dto.price,
      stock: dto.stock,
      categoryId: dto.category_id,
      imageUrl: dto.image_url,
    });
  }

  async update(id: string, tenantId: string, dto: UpdateProductDto) {
    const existing = await this.productRepository.findById(id, tenantId);
    if (!existing) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: `Product with id ${id} not found`,
      });
    }

    return this.productRepository.update(id, tenantId, {
      name: dto.name,
      price: dto.price,
      stock: dto.stock,
      categoryId: dto.category_id,
      imageUrl: dto.image_url,
    });
  }

  async delete(id: string, tenantId: string) {
    const existing = await this.productRepository.findById(id, tenantId);
    if (!existing) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: `Product with id ${id} not found`,
      });
    }

    return this.productRepository.delete(id, tenantId);
  }
}
