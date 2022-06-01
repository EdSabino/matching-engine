import { Order, OrderType, Prisma } from '@matching-engine/prisma';
import { PrismaService } from 'src/prisma.service';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostTradeService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  @RabbitSubscribe({
    exchange: 'postTradeExchange',
    routingKey: 'post.trade.key.*.*',
    queue: 'post.trade.queue',
  })
  public async call(msg: Record<string, any>): Promise<void> {
    const { order, trades } = msg;
    await this.prisma.order.update({
      data: this.getOrderArgs(order),
      where: {
        id: order.id
      }
    });

    await Promise.all(trades.map(async (tradeRaw) => {
      tradeRaw.trade.tenantId = order.tenantId;
      const trade = tradeRaw.trade  as Prisma.TradeCreateInput;
      const counterOrder = tradeRaw.counterOrder as Order;
      return await this.prisma.$transaction([
        this.prisma.trade.create({
          data: trade,
        }),
        this.prisma.order.update({
          data: this.getOrderArgs(counterOrder),
          where: {
            id: counterOrder.id
          }
        })
      ]);
    }));
  }

  private getOrderArgs(order: Order) {
    return {
      [OrderType.LIMIT]: ({
        tradedVolume: order.tradedVolume,
        locked: order.locked,
        tradesCount: order.tradesCount,
        status: order.status
      }),
      [OrderType.MARKET]: ({
        tradedVolume: order.tradedVolume,
        locked: order.locked,
        price: Math.floor(order.price),
        tradesCount: order.tradesCount,
        status: order.status
      })
    }[order.orderType];
  }
}
