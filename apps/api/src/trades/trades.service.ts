import { Prisma, Trade } from "@matching-engine/prisma";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class TradesService {
  constructor(private readonly prisma: PrismaService) {}

  async getTrades(filter: Prisma.TradeWhereInput): Promise<Trade[]> {
    return this.prisma.trade.findMany({
      where: filter
    });
  }
}