import { Injectable } from '@nestjs/common';
import { Book, Order, Prisma } from '@matching-engine/prisma';
import { PrismaService } from '../prisma.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly amqpConnection: AmqpConnection
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

  async cancelOrderById(orderId: number, tenantId: number): Promise<Order> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        tenantId: tenantId
      }
    });

    this.amqpConnection.publish(
      'newOrdersExchange',
      `matching.key.${order.market}.${order.tenantId}`,
      {
        action: 'cancel',
        order: order
      }
    );

    return order;
  }

  async getOrders(filter: Prisma.OrderWhereInput): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: filter
    });
  }

  async getBooks(tenantId: number, market: string): Promise<Book> {
    return this.prisma.book.findUnique({
      where: {
        tenantId_market: {
          tenantId,
          market
        }
      }
    });
  }
}