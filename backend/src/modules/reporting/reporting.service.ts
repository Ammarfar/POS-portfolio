import { Injectable } from '@nestjs/common';
import { ReportingRepository } from './reporting.repository';

@Injectable()
export class ReportingService {
  constructor(private readonly reportingRepository: ReportingRepository) {}

  async getDashboardSummary(tenantId: string) {
    return this.reportingRepository.getDashboardSummary(tenantId);
  }

  async getTopProducts(tenantId: string) {
    return this.reportingRepository.getTopProducts(tenantId);
  }

  async getSalesReport(
    tenantId: string,
    options: { dateRange?: string; search?: string; page?: number; limit?: number },
  ) {
    return this.reportingRepository.getSalesReport(tenantId, options);
  }
}
