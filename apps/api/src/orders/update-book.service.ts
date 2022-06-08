import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { WebhookAction } from '@matching-engine/prisma';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

interface PriceLevel {
  price: number;
  totalVolume: number;
}

interface BookUpdateExchangeMessage {
  bid: PriceLevel[];
  ask: PriceLevel[];
  tenantId: number;
  market: string;
}

@Injectable()
export class UpdateBookService {
  constructor(
    private readonly prisma: PrismaService,
    private httpService: HttpService
  ) {}

  @RabbitSubscribe({
    exchange: 'bookUpdateExchange',
    routingKey: 'book.update.key.*.*',
    queue: 'book.update.queue',
  })
  public async call(msg: BookUpdateExchangeMessage): Promise<void> {
    const bid = this.processLevels(msg.bid);
    const ask = this.processLevels(msg.ask);
    
    const r = await this.prisma.book.upsert({
      create: {
        tenantId: msg.tenantId,
        market: msg.market,
        book: JSON.stringify({
          bid,
          ask
        }),
        topAsk: ask[0]?.[0] || 0,
        topBid: bid[0]?.[0] || 0,
        lowAsk: ask[ask.length - 1]?.[0] || 0,
        lowBid: ask[ask.length - 1]?.[0] || 0
      },
      update: {
        book: JSON.stringify({
          bid,
          ask
        }),
        topAsk: ask[0]?.[0] || 0,
        topBid: bid[0]?.[0] || 0,
        lowAsk: ask[ask.length - 1]?.[0] || 0,
        lowBid: ask[ask.length - 1]?.[0] || 0
      },
      where: {
        tenantId_market: {
          tenantId: msg.tenantId,
          market: msg.market,
        }
      }
    });
    console.log(r)
    const webhook = await this.prisma.webhook.findFirst({
      where: {
        tenantId: msg.tenantId,
        action: WebhookAction.NEWTRADES
      }
    });

    if (webhook) {
      this.httpService.post(webhook.fullAddress, {
        bid,
        ask
      });
    }
  }

  private processLevels(levels: PriceLevel[]): any[] {
    return levels.reduce((previousValue: any[], currentValue: PriceLevel) => {
      previousValue.push([
        currentValue.price,
        currentValue.totalVolume
      ]);
      return previousValue;
    }, []);
  }
}
