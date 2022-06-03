import { Order, OrderSide, OrderType, Status } from '@prisma/client';
import * as Factory from 'factory.ts';

export const buildOrder = Factory.Sync.makeFactory<Order>({
  id: Factory.each((i) => i),
  market: 'btcbrl',
  side: OrderSide.ASK,
  orderType: OrderType.LIMIT,
  volume: 10,
  price: 100,
  locked: 10,
  tradedVolume: 0,
  status: Status.OPENED,
  tradesCount: 0,
  tenantId: Factory.each((i) => i),
  externalId: 1,
  createdAt: new Date()
});