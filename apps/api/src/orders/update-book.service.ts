import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { WebhookAction } from '@matching-engine/prisma';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
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
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  @RabbitSubscribe({
    exchange: 'bookUpdateExchange',
    routingKey: 'book.update.key.*.*',
    queue: 'book.update.queue',
  })
  public async call(msg: BookUpdateExchangeMessage): Promise<void> {
    const client = this.getClient();
    const bid = this.processLevels(msg.bid);
    const ask = this.processLevels(msg.ask);
    await client.set(`book.${msg.tenantId}.${msg.market}.bid`, JSON.stringify(bid));
    await client.set(`book.${msg.tenantId}.${msg.market}.ask`, JSON.stringify(ask));

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

  private getClient() {
    return (this.cacheManager.store as any).getClient();
  }
}
