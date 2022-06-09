import { KLine, Tenant } from '@matching-engine/prisma';
import { Controller, Get, Query, Session, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { TenantAuthInterceptor } from 'src/tenants/tenants-auth.interceptor';
import { AnalyticsService } from './analytics.service';
import { KLineFilters } from './dto/analytics-filter.dto';
import { KLineDto } from './dto/kline.dto';

@Controller('analytics')
@UseInterceptors(TenantAuthInterceptor)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @ApiResponse({
    status: 200,
    type: KLineDto
  })
  @ApiResponse({
    status: 403,
  })
  async getAnalytics(@Session() session: Tenant, @Query() query: KLineFilters): Promise<KLine[]> {
    return this.analyticsService.getKlines({
      market: query.market,
      lastTradedSecond: query.lastTradedSecond,
      tenantId: session.id
    }, query.limit);
  }
}
