import { Tenant, Trade } from '@matching-engine/prisma';
import { Controller, Get, Query, Session, UseInterceptors } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { TenantAuthInterceptor } from 'src/tenants/tenants-auth.interceptor';
import { TradeDto } from './dto/trade.dto';
import { TradesFilter } from './dto/trades-filter.dto';
import { TradesService } from './trades.service';

@Controller('trades')
@UseInterceptors(TenantAuthInterceptor)
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Get()
  @ApiResponse({
    status: 200,
    type: TradeDto
  })
  @ApiResponse({
    status: 403,
  })
  async getTrades(@Session() session: Tenant, @Query() query: TradesFilter): Promise<Trade[]> {
    return this.tradesService.getTrades({
      ...query,
      tenantId: session.id
    });
  }
}
