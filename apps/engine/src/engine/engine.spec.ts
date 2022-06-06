import { Order, OrderSide, Trade, buildOrder, Status } from "@matching-engine/prisma";
import { Engine } from "./engine";

jest
  .useFakeTimers()
  .setSystemTime(new Date('2022-06-06T13:40:02.192Z'));
  
describe('Engine', () => {
  let engine: Engine;
  let order: Order;

  beforeEach(() => {
    engine = Engine.create();
  });

  describe('#cancel', () => {
    let result: {
      order: Order,
      trades: {
        counterOrder: Order,
        trade: Partial<Trade>
      }[]
    };

    describe('with order with no match', () => {
      beforeEach(async () => {
        order = buildOrder.build();
        await engine.submit(order);

        result = await engine.cancel(order);
      });

      it('cancels order', () => {
        expect(result.order.status).toEqual(Status.CANCELED);
      });

      it('remove order from book', () => {
        expect(engine.orderbooks[OrderSide.ASK].top()).toBeUndefined();
      });
    });
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
              createdAt: new Date('2022-06-06T13:40:02.192Z'),
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