import { Tenant, Trade } from '@matching-engine/prisma';
import { Controller, Get, Query, Session, UseInterceptors } from '@nestjs/common';
import { TenantAuthInterceptor } from 'src/tenants/tenants-auth.interceptor';
import { TradesFilter } from './dto/trades-filter.dto';
import { TradesService } from './trades.service';

@Controller('trades')
@UseInterceptors(TenantAuthInterceptor)
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Get()
  async getTrades(@Session() session: Tenant, @Query() query: TradesFilter): Promise<Trade[]> {
    return this.tradesService.getTrades({
      ...query,
      tenantId: session.id
    });
  }
}
