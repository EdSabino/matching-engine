import { Order, OrderSide, OrderType, Trade } from '@matching-engine/prisma';
import { Tree } from 'functional-red-black-tree';

class PriceLevels {
  constructor(public price: number, public orders: Order[]) {
    orders.forEach((order: Order) => {
      this.totalVolume += order.volume;
    });
  }

  public totalVolume: number = 0;

  add(order: Order) {
    this.orders.push(order);
    this.totalVolume += order.volume;
  }

  remove(order: Order) {
    this.orders = this.orders.filter((actOrder) => order.id !== actOrder.id)
  }

  toJSON() {
    return {
      price: this.price,
      totalVolume: this.totalVolume
    }
  }
}

export class Orderbook {
  constructor(
    private readonly side: OrderSide,
    private limitOrders: Tree<number, PriceLevels>,
    private marketOrders: Tree<number, Order>
  ) {}

  updateVolume(order: Order, trade: Partial<Trade>) {
    if (order.orderType === OrderType.LIMIT) {
      this.limitOrders.get(order.price).totalVolume -= trade.volume;
    }
  }

  getLimitBook() {
    return this.limitOrders.values;
  }

  top(): Order {
    if (this.marketOrders.length === 0) {
      return this.limitTop()
    } else {
      const order = this.marketOrders.begin.value;

      return order as Order;
    }
  }

  limitTop(): Order {
    const action = {
      [OrderSide.ASK]: 'begin',
      [OrderSide.BID]: 'end'
    }[this.side];

    const order = this.limitOrders[action].value?.orders[0];

    return order;
  }

  add(order: Order) {
    return {
      [OrderType.LIMIT]: () => this.addLimitOrder(order),
      [OrderType.MARKET]: () => this.marketOrders = this.marketOrders.insert(order.id, order)
    }[order.orderType]();
  }

  remove(order: Order) {
    return {
      [OrderType.LIMIT]: () => this.removeLimit(order),
      [OrderType.MARKET]: () => this.marketOrders = this.marketOrders.remove(order.id)
    }[order.orderType]();
  }

  private addLimitOrder(order: Order) {
    const level = this.limitOrders.get(order.price);

    if (level) {
      level.add(order);
    } else {
      this.limitOrders = this.limitOrders.insert(order.price, new PriceLevels(order.price, [order]));
    }
  }

  private removeLimit(order: Order) {
    const level = this.limitOrders.get(order.price);

    if (level) {
      level.remove(order);
      if (level.orders.length === 0) {
        this.limitOrders = this.limitOrders.remove(order.price);
      }
    } else {
      this.limitOrders = this.limitOrders.remove(order.price);
    }
  }
}
