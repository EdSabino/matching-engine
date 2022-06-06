import { Injectable } from '@nestjs/common';
import { KLine, Prisma } from '@matching-engine/prisma';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async getKlines(filter: Prisma.KLineWhereInput, limit: number): Promise<KLine[]> {
    return this.prisma.kLine.findMany({
      where: filter,
      take: limit
    });
  }
}