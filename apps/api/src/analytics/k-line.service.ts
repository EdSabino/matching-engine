import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { KLine, Trade } from '@matching-engine/prisma/dist';
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class KLineService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}


  @RabbitSubscribe({
    exchange: 'postTradeExchange',
    routingKey: 'post.trade.key.true',
    queue: 'post.kline.queue',
  })
  public async call(msg: any): Promise<void> {
    try {

      console.log(msg)
      for (let { trade } of msg.trades) {
        const [highestValue, lowestValue] = await this.getHighestAndLowest(msg.order.tenantId, msg.order.market, trade);
        const tradeCreatedAt = new Date(trade.createdAt).getTime()/1000;
        const key = (tradeCreatedAt - (tradeCreatedAt % 5)) + 5;

        const kline = await this.prisma.kLine.findUnique({
          where: {
            tenantId_market_lastTradedSecond: {
              market: msg.order.market,
              tenantId: msg.order.tenantId,
              lastTradedSecond: key
            }
          }
        });
        
        if (kline) {
          const isFirst = tradeCreatedAt < (kline.openTime.getTime() / 1000);
          await this.prisma.kLine.update({
            where: {
              tenantId_market_lastTradedSecond: {
                market: msg.order.market,
                tenantId: msg.order.tenantId,
                lastTradedSecond: key
              }
            },
            data: {
              openTime: isFirst ?  new Date(trade.createdAt) : kline.openTime,
              openValue: isFirst ? trade.price : kline.openValue,
              highestValue: Math.max(highestValue, kline.highestValue, trade.price),
              lowestValue: Math.min(lowestValue, kline.lowestValue, trade.price),
              closeValue: trade.price,
              closeTime: tradeCreatedAt > kline.closeTime.getTime() / 1000 ? new Date(trade.createdAt) : kline.closeTime,
              numberTrades: kline.numberTrades + 1,
              tradedVolume: trade.volume + kline.tradedVolume
            }
          });
        } else {
          await this.prisma.kLine.create({
            data: {
              openTime: new Date(trade.createdAt),
              openValue: trade.price,
              highestValue: Math.max(highestValue, trade.price),
              lowestValue: Math.min(lowestValue, trade.price),
              closeValue: trade.price,
              closeTime: new Date(trade.createdAt),
              numberTrades: 1,
              tradedVolume: trade.volume,
              tenantId: msg.order.tenantId,
              market: msg.order.market,
              lastTradedSecond: key
            }
          });
        }
      }
    } catch (e) {
      console.log(e)
    }
  }
  
  private async getHighestAndLowest(tenantId: number, market: string, trade: Partial<Trade>): Promise<number[]> {
    const bids: Array<any> = await this.cacheManager.get(`book.${tenantId}.${market}.bid`);
    const asks: Array<any> = await this.cacheManager.get(`book.${tenantId}.${market}.ask`);
    const highestValue = asks?.[0]?.[0] || bids?.[bids.length - 1]?.[0] || trade.price;
    const lowestValue = bids?.[0]?.[0] || asks?.[asks.length - 1]?.[0] || trade.price;

    return [highestValue, lowestValue];
  }

}
