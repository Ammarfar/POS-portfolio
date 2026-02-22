import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type JwtPayload } from '../../common/decorators/current-user.decorator';
import { ReportingService } from './reporting.service';

@ApiTags('Analytics & Reports')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller()
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('analytics/summary')
  @ApiOperation({ summary: 'Dashboard summary metrics' })
  async getSummary(@CurrentUser() user: JwtPayload) {
    return this.reportingService.getDashboardSummary(user.tenantId);
  }

  @Get('analytics/top-products')
  @ApiOperation({ summary: 'Top selling products' })
  async getTopProducts(@CurrentUser() user: JwtPayload) {
    return this.reportingService.getTopProducts(user.tenantId);
  }

  @Get('reports/sales')
  @ApiOperation({ summary: 'Paginated sales report' })
  @ApiQuery({ name: 'date_range', required: false, enum: ['today', '7D', '30D', 'YTD'] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getSalesReport(
    @CurrentUser() user: JwtPayload,
    @Query('date_range') dateRange?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportingService.getSalesReport(user.tenantId, {
      dateRange,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }
}
