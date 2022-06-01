import { Order, OrderSide, OrderType, buildOrder } from "@matching-engine/prisma";
import { Orderbook } from "./orderbook";
import createRBTree = require('functional-red-black-tree');

describe('Orderbook', () => {
  let orderbook: Orderbook;
  let side: OrderSide;

  beforeEach(() => {
    orderbook = new Orderbook(side, createRBTree(), createRBTree());
  });

  describe('#top', () => {
    beforeAll(() => {
      side = OrderSide.ASK;
    });

    describe('when empty books', () => {
      it('returns undefined', () => {
        expect(orderbook.top()).toBeUndefined();
      });
    });

    describe('when only market book', () => {
      let order: Order;

      beforeEach(() => {
        order = buildOrder.build({
          orderType: OrderType.MARKET
        });
        orderbook.add(order);
      });

      it('returns order', () => {
        expect(orderbook.top()).toEqual(order);
      });
    });

    describe('when only limit book', () => {
      let order: Order;

      beforeEach(() => {
        order = buildOrder.build();
        orderbook.add(order);
      });

      it('returns order', () => {
        expect(orderbook.top()).toEqual(order);
      });
    });

    describe('when both books have order', () => {
      let order: Order;

      beforeEach(() => {
        order = buildOrder.build({
          orderType: OrderType.MARKET
        });
        orderbook.add(order);
        orderbook.add(buildOrder.build());
      });

      it('returns order', () => {
        expect(orderbook.top()).toEqual(order);
      });
    });
  });

  describe('#limitTop', () => {
    describe('with only market order', () => {
      beforeAll(() => {
        side = OrderSide.ASK;
      });

      beforeEach(() => {
        orderbook.add(buildOrder.build({
          orderType: OrderType.MARKET
        }));
      });

      it('returns undefined', () => {
        expect(orderbook.limitTop()).toBeUndefined()
      });
    });

    describe('when ASK', () => {
      let order: Order;

      beforeAll(() => {
        side = OrderSide.ASK;
      });

      beforeEach(() => {
        order = buildOrder.build();
        orderbook.add(order);
        orderbook.add(buildOrder.build({
          price: 101,
        }));

      });

      it('returns first order', () => {
        expect(orderbook.limitTop()).toEqual(order);
      });
    });

    describe('when BID', () => {
      let order: Order;

      beforeAll(() => {
        side = OrderSide.BID;
      });

      beforeEach(() => {
        order = buildOrder.build();
        orderbook.add(order);
        orderbook.add(buildOrder.build({
          price: 99,
        }));

      });

      it('returns last order', () => {
        expect(orderbook.limitTop()).toEqual(order);
      });
    });
  });

  describe('#remove', () => {
    let order: Order;

    beforeAll(() => {
      side = OrderSide.ASK;
    });

    beforeEach(() => {
      order = buildOrder.build();
      orderbook.add(order);
    });

    it('removes it from the book', () => {
      expect(orderbook.top()).toEqual(order);
      orderbook.remove(order);
      expect(orderbook.top()).toBeUndefined();
    });
  });
});