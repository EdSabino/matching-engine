import { KLine, Tenant } from '@matching-engine/prisma/dist';
import { Controller, Get, Query, Session, UseInterceptors } from '@nestjs/common';
import { TenantAuthInterceptor } from 'src/tenants/tenants-auth.interceptor';
import { AnalyticsService } from './analytics.service';
import { KLineFilters } from './dto/analytics-filter.dto';

@Controller('analytics')
@UseInterceptors(TenantAuthInterceptor)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  async getAnalytics(@Session() session: Tenant, @Query() query: KLineFilters): Promise<KLine[]> {
    return this.analyticsService.getKlines({
      market: query.market,
      lastTradedSecond: query.lastTradedSecond,
      tenantId: session.id
    }, query.limit);
  }
}
