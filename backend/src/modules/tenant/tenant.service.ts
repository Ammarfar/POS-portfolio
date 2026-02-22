import { Injectable } from '@nestjs/common';
import { TenantRepository } from './tenant.repository';

@Injectable()
export class TenantService {
  constructor(private readonly tenantRepository: TenantRepository) {}

  async findById(id: string) {
    return this.tenantRepository.findById(id);
  }

  async create(name: string) {
    return this.tenantRepository.create(name);
  }
}
