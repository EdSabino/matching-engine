import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { TradesController } from './trades.controller';
import { TradesService } from './trades.service';

@Module({
  imports: [],
  controllers: [TradesController],
  providers: [PrismaService, TradesService],
})
export class TradesModule {}
