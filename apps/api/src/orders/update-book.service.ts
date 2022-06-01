import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

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
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @RabbitSubscribe({
    exchange: 'bookUpdateExchange',
    routingKey: 'book.update.key.*.*',
    queue: 'book.update.queue',
  })
  public async call(msg: BookUpdateExchangeMessage): Promise<void> {
    const client = this.getClient();
    await client.set(`book.${msg.tenantId}.${msg.market}.bid`, JSON.stringify(this.processLevels(msg.bid)));
    await client.set(`book.${msg.tenantId}.${msg.market}.ask`, JSON.stringify(this.processLevels(msg.ask)));
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
