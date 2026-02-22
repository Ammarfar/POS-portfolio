import { Module } from '@nestjs/common';
import { TenantRepository } from './tenant.repository';
import { TenantService } from './tenant.service';

@Module({
  providers: [TenantService, TenantRepository],
  exports: [TenantService],
})
export class TenantModule {}
