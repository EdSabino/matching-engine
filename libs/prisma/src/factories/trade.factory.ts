import { Trade } from '@prisma/client';
import * as Factory from 'factory.ts';

export const buildTrade = Factory.Sync.makeFactory<Trade>({
  id: Factory.each((i) => i),
  market: 'btcbrl',
  price: 100,
  volume: 10,
  funds: 1000,
  makerId: 1,
  takerId: 2,
  tenantId: Factory.each((i) => i),
  createdAt: new Date()
});