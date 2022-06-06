import { Order, OrderSide } from "@matching-engine/prisma";
import { Exchange } from "amqp-ts";
import { Engine } from "./engine/engine";
import { EngineNotFound } from "./engine/errors/engine-not-found.error";
import * as Amqp from 'amqp-ts';

export class Matching {
  constructor(
    private readonly engines: Record<string, Engine>,
    private readonly postTradeExchange: Exchange,
    private readonly bookUpdateExchange: Exchange,
    private readonly tenantId: number
  ) {}

  public dryRun: boolean = false;

  public async submit(message: Record<any, any>): Promise<void> {
    const engine = this.getEngine(message.order.market);

    const result = await engine.submit(message.order as Order);

    if (!this.dryRun) {
      this.postTradeExchange.send(new Amqp.Message(JSON.stringify(result)), `post.trade.key.${result.trades.length > 0}`)
    }

    this.propagateBook(engine, message.order.market);
  }

  public async cancel(message: Record<any, any>): Promise<void> {
    const engine = this.getEngine(message.order.market);

    const result = await engine.cancel(message.order as Order);

    if (!this.dryRun) {
      this.postTradeExchange.send(new Amqp.Message(JSON.stringify(result)), `post.trade.key.${result.trades.length > 0}`)
    }

    this.propagateBook(engine, message.order.market);
  }

  private getEngine(market: string): Engine {
    const engine = this.engines[market];

    if (!engine) {
      throw new EngineNotFound('Engine not found.');
    }

    return engine;
  }

  private propagateBook(engine: Engine, market: string) {
    this.bookUpdateExchange.send(new Amqp.Message(JSON.stringify({
      bid: engine.orderbooks[OrderSide.BID].getLimitBook(),
      ask: engine.orderbooks[OrderSide.ASK].getLimitBook(),
      tenantId: this.tenantId,
      market: market
    })), `book.update.key.${market}.${this.tenantId}`)
  }
}
