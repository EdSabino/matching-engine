import { Orderbook } from './entities/orderbook';
import { TradeService } from './services/trade.service';
import createRBTree = require('functional-red-black-tree');
import { EmptyBookError } from './errors/empty-book.error';
import { Order, OrderSide, OrderType, Status, Trade } from '@matching-engine/prisma';
import { Stats } from 'fs';

export class Engine {
  constructor(public readonly orderbooks: Record<OrderSide, Orderbook>, private readonly tradeService: TradeService) {}

  static create(): Engine {
    return new Engine({
      [OrderSide.ASK]: new Orderbook(OrderSide.ASK, createRBTree(), createRBTree()),
      [OrderSide.BID]: new Orderbook(OrderSide.BID, createRBTree(), createRBTree()),
    }, new TradeService());
  }

  public async cancel(order: Order): Promise<{
    order: Order,
    trades: {
      counterOrder: Order,
      trade: Partial<Trade>
    }[]
  }> {
    const orderbook = this.orderbooks[order.side];

    order.status = order.tradedVolume > 0 ? Status.PARTIALLY_FILLED : Status.CANCELED;

    orderbook.remove(order);

    return {
      order,
      trades: []
    };
  }

  public async submit(order: Order): Promise<{
    order: Order,
    trades: {
      counterOrder: Order,
      trade: Partial<Trade>
    }[]
  }> {
    const trades = [];
    const counterBook = this.getCounterBook(order.side);
    this.lockOrder(order, counterBook.limitTop()?.price || 100)

    try {
      /* eslint-disable no-constant-condition */
      while (true) {
        if (this.isFilled(order)) {
          break;
        }
        
        const counterOrder = counterBook.top();
        
        if (!counterOrder) {
          break;
        }

        const trade = this.tradeService.trade(order, counterOrder, counterBook);
        
        this.fillTop(counterBook, trade);
        
        this.fillOrder(order, trade);
        
        trades.push({
          counterOrder,
          trade
        });
      }
    } catch (e) {
      if (!(e instanceof EmptyBookError)) {
        throw e;
      }
    }

    this.calculateMarketPrice(order, trades);

    if (!this.isFilled(order)) {
      const book = this.orderbooks[order.side];
      book.add(order);
    } else {
      order.status = Status.FILLED;
    }

    return {
      order,
      trades
    };
  }

  private calculateMarketPrice(order: Order, trades: Partial<Trade>[]) {
    if (order.orderType === OrderType.MARKET) {
      order.price = trades.reduce((previous: number, trade: Partial<Trade>) => trade.price + previous, 0) / trades.length;
    }
  }

  private getCounterBook(side: OrderSide): Orderbook {
    if (side === OrderSide.ASK) {
      return this.orderbooks[OrderSide.BID];
    } else {
      return this.orderbooks[OrderSide.ASK];
    }
  }

  private lockOrder(order: Order, price: number) {
    if (order.side === OrderSide.ASK) {
      order.locked = order.volume;
      return;
    }

    order.locked = order.volume * (order.orderType === OrderType.MARKET ? price : order.price);
  }

  private isFilled(order: Order): boolean {
    return order.volume <= 0;
  }

  private fillOrder(order: Order, trade: Partial<Trade>) {
    order.tradesCount++;
    order.volume -= trade.volume;
    order.tradedVolume += trade.volume;
  }

  private fillTop(book: Orderbook, trade: Partial<Trade>) {
    const order = book.top();
    this.fillOrder(order, trade);
    book.updateVolume(order, trade);

    if (this.isFilled(order)) {
      order.status = Status.FILLED;
      book.remove(order);
    }
  }
}
