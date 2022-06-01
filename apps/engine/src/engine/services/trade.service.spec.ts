import { Order, OrderSide, OrderType, buildOrder } from "@matching-engine/prisma";
import { Orderbook } from "../entities/orderbook";
import { TradeService } from "./trade.service";
import createRBTree = require('functional-red-black-tree');

describe('TradeService', () => {
  const tradeService: TradeService = new TradeService();
  let orderbook: Orderbook;
  let order: Order;
  let counterOrder: Order;

  beforeEach(() => {
    orderbook = new Orderbook(OrderSide.ASK, createRBTree(), createRBTree())
  });

  describe('#trade', () => {
    describe('LimitVsLimit', () => {
      beforeEach(() => {
        order = buildOrder.build({
          side: OrderSide.BID,
          orderType: OrderType.LIMIT
        });
        counterOrder = buildOrder.build({
          orderType: OrderType.LIMIT
        });

        orderbook.add(counterOrder);
      });

      it('returns expected trade', () => {
        expect(tradeService.trade(order, counterOrder, orderbook)).toEqual({
          price: 100,
          volume: 10,
          funds: 1000,
          market: 'btcbrl',
          makerId: counterOrder.id,
          takerId: order.id
        });
      });
    });

    describe('LimitVsMarket', () => {
      beforeEach(() => {
        order = buildOrder.build({
          side: OrderSide.BID,
          orderType: OrderType.LIMIT
        });
        counterOrder = buildOrder.build();

        orderbook.add(counterOrder);
      });

      it('returns expected trade', () => {
        expect(tradeService.trade(order, counterOrder, orderbook)).toEqual({
          price: 100,
          volume: 10,
          funds: 1000,
          market: 'btcbrl',
          makerId: counterOrder.id,
          takerId: order.id
        });
      });
    });

    describe('MarketVsLimit', () => {
      beforeEach(() => {
        order = buildOrder.build({
          side: OrderSide.BID,
        });
        counterOrder = buildOrder.build({
          orderType: OrderType.MARKET
        });

        orderbook.add(counterOrder);
      });

      it('returns expected trade', () => {
        expect(tradeService.trade(order, counterOrder, orderbook)).toEqual({
          price: 100,
          volume: 10,
          funds: 1000,
          market: 'btcbrl',
          takerId: counterOrder.id,
          makerId: order.id
        });
      });
    });

    describe('MarketVsMarket', () => {
      beforeEach(() => {
        order = buildOrder.build({
          side: OrderSide.BID,
          orderType: OrderType.MARKET
        });
        counterOrder = buildOrder.build({
          orderType: OrderType.MARKET
        });

        orderbook.add(counterOrder);
        orderbook.add(buildOrder.build({
          orderType: OrderType.LIMIT,
          price: 104
        }));
      });

      it('returns expected trade', () => {
        expect(tradeService.trade(order, counterOrder, orderbook)).toEqual({
          price: 104,
          volume: 0.09615384615384616,
          funds: 10,
          market: 'btcbrl',
          makerId: counterOrder.id,
          takerId: order.id
        });
      });
    });
  });
});