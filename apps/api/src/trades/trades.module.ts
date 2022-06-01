import { Module } from '@nestjs/common';
import { TradesController } from './trades.controller';
import { TradesService } from './trades.service';

@Module({
  imports: [],
  controllers: [TradesController],
  providers: [TradesService],
})
export class TradesModule {}
