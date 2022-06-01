import { Orderbook } from '../entities/orderbook';
import { Order, OrderSide, OrderType, Trade } from '@matching-engine/prisma';
import { EmptyBookError } from '../errors/empty-book.error';

export class TradeService {
  trade(order: Order, counterOrder: Order, counterBook: Orderbook): Partial<Trade> {
    return {
      [OrderType.LIMIT]: {
        [OrderType.LIMIT]: new LimitVsLimit(order, counterOrder, counterBook),
        [OrderType.MARKET]: new LimitVsMarket(order, counterOrder, counterBook),
      },
      [OrderType.MARKET]: {
        [OrderType.LIMIT]: new MarketVsLimit(order, counterOrder, counterBook),
        [OrderType.MARKET]: new MarketVsMarket(order, counterOrder, counterBook),
      }
    }[order.orderType][counterOrder.orderType].call();
  }
}

abstract class TradeWith {
  constructor(protected readonly order: Order, protected readonly counterOrder: Order, protected readonly counterBook: Orderbook) {}

  protected getOrderPrice(order: Order, price: number): number {
    return {
      [OrderSide.ASK]: order.locked,
      [OrderSide.BID]: order.locked / price
    }[order.side];
  }

  protected hitsThreashold(counterOrder: Order, order: Order): boolean {
    return {
      [OrderSide.ASK]: counterOrder.price >= order.price,
      [OrderSide.BID]: counterOrder.price <= order.price
    }[counterOrder.side];
  }

  protected createTrade(price: number, volume: number, funds: number, makerId: number, takerId: number, market: string): Partial<Trade> {
    return {
      price,
      volume,
      funds,
      market,
      makerId,
      takerId
    }
  }

  abstract call(): Partial<Trade>;
}

class LimitVsLimit extends TradeWith {
  call(): Partial<Trade> {
    if (this.hitsThreashold(this.counterOrder, this.order)) {
      const price = this.counterOrder.price;
      const volume = Math.min(this.order.volume, this.counterOrder.volume);
      const funds = price * volume;

      return this.createTrade(price, volume, funds, this.counterOrder.id, this.order.id, this.order.market);
    }
    throw new EmptyBookError('Not matched');
  }
}

class LimitVsMarket extends TradeWith {
  call(): Partial<Trade> {
    const volume = Math.min(this.order.volume, this.counterOrder.volume, this.getOrderPrice(this.counterOrder, this.order.price))
    const funds = this.order.price * volume;
    return this.createTrade(this.order.price, volume, funds, this.order.id, this.counterOrder.id, this.order.market);
  }
}

class MarketVsLimit extends TradeWith {
  call(): Partial<Trade> {
    const price = this.counterOrder.price;
    const volume = Math.min(this.order.volume, this.counterOrder.volume, this.getOrderPrice(this.order, this.counterOrder.price));
    const funds = price * volume;

    return this.createTrade(price, volume, funds, this.counterOrder.id, this.order.id, this.order.market);
  }
}

class MarketVsMarket extends TradeWith {
  call(): Partial<Trade> {
    const price = this.counterBook.limitTop().price;
    const volume = Math.min(this.order.volume, this.counterOrder.volume, this.getOrderPrice(this.order, price), this.getOrderPrice(this.counterOrder, price));
    const funds = price * volume;

    return this.createTrade(price, volume, funds, this.counterOrder.id, this.order.id, this.order.market);
  }
}
