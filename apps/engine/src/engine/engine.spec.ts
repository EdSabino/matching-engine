import { Order, OrderSide, Trade, buildOrder } from "@matching-engine/prisma";
import { Engine } from "./engine";

describe('Engine', () => {
  let engine: Engine;
  let order: Order;

  beforeEach(() => {
    engine = Engine.create();
  });

  describe('#submit', () => {
    let result: {
      order: Order,
      trades: {
        counterOrder: Order,
        trade: Partial<Trade>
      }[]
    };

    describe('with empty book', () => {
      beforeEach(async () => {
        order = buildOrder.build();
        result = await engine.submit(order);
      });

      it('dont create trade', () => {
        expect(result).toEqual({
          order,
          trades: []
        })
      });

      it('adds order to book', () => {
        expect(engine.orderbooks[OrderSide.ASK].top()).toEqual(order);
      });
    });

    describe('with matchable order', () => {
      let counterOrder: Order;

      beforeEach(async () => {
        order = buildOrder.build();
        counterOrder = buildOrder.build({
          side: OrderSide.BID
        });

        await engine.submit(counterOrder);
        result = await engine.submit(order);
      });

      it('creates trade', () => {
        expect(result).toEqual({
          order,
          trades: [{
            trade: {
              price: 100,
              volume: 10,
              funds: 1000,
              market: 'btcbrl',
              makerId: counterOrder.id,
              takerId: order.id
            },
            counterOrder
          }]
        })
      });

      it('empties book', () => {
        expect(engine.orderbooks[OrderSide.ASK].top()).toBeUndefined();
      });
    });
  });
});