import { Tenant, Trade } from '@matching-engine/prisma/dist';
import { Controller, Get, Query, Session } from '@nestjs/common';
import { TradesFilter } from './dto/trades-filter.dto';
import { TradesService } from './trades.service';

@Controller('trades')
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
