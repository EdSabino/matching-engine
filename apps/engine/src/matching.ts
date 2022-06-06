import { Order, OrderSide } from "@matching-engine/prisma";
import { Exchange } from "amqp-ts";
import { Engine } from "./engine/engine";
import { EngineNotFound } from "./engine/errors/engine-not-found.error";
import * as Amqp from 'amqp-ts';
import { Console } from "console";

export class Matching {
  constructor(
    private readonly engines: Record<string, Engine>,
    private readonly postTradeExchange: Exchange,
    private readonly bookUpdateExchange: Exchange,
    private readonly tenantId: number
  ) {}

  public dryRun: boolean = false;

  public async call(message: Record<any, any>): Promise<void> {
    const engine = this.engines[message.order.market];

    if (!engine) {
      throw new EngineNotFound('Engine not found.');
    }

    const result = await engine.submit(message.order as Order);
    console.log(JSON.stringify(result))
    if (!this.dryRun) {
      this.postTradeExchange.send(new Amqp.Message(JSON.stringify(result)), `post.trade.key.${result.trades.length > 0}`)
    }

    this.bookUpdateExchange.send(new Amqp.Message(JSON.stringify({
      bid: engine.orderbooks[OrderSide.BID].getLimitBook(),
      ask: engine.orderbooks[OrderSide.ASK].getLimitBook(),
      tenantId: this.tenantId,
      market: message.order.market
    })), `book.update.key.${message.order.market}.${this.tenantId}`)
  }


}
