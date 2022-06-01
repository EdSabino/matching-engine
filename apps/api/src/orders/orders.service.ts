import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Order, Prisma } from '@matching-engine/prisma';
import { PrismaService } from '../prisma.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Cache } from 'cache-manager';
import { Books } from './dto/books.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly amqpConnection: AmqpConnection,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async create(order: Prisma.OrderUncheckedCreateInput) {
    const createdOrder = await this.prisma.order.create({ data: order });

    this.amqpConnection.publish(
      'newOrdersExchange',
      `matching.key.${order.market}.${order.tenantId}`,
      {
        action: 'submit',
        order: createdOrder
      }
    );

    return createdOrder;
  }

  async getOrders(filter: Prisma.OrderWhereInput): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: filter
    });
  }

  async getBooks(tenantId: number, market: string): Promise<Books> {
    return {
      bid: await this.cacheManager.get(`book.${tenantId}.${market}.bid`),
      ask: await this.cacheManager.get(`book.${tenantId}.${market}.ask`),
    };
  }
}