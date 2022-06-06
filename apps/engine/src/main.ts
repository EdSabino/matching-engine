import { PrismaClient, Status, Tenant } from '@matching-engine/prisma';
import * as Amqp from 'amqp-ts';
import { Engine } from './engine/engine';
import { Matching } from './matching';

const matchings = {};

async function bootstrap() {
  const prisma = new PrismaClient();
  const tenants = await prisma.tenant.findMany();
  const connection = new Amqp.Connection('amqp://localhost:5672');
  const exchange = connection.declareExchange('newOrdersExchange');
  const postTradeExchange = connection.declareExchange('postTradeExchange', 'topic');
  const bookUpdateExchange = connection.declareExchange('bookUpdateExchange', 'topic');

  await Promise.all(tenants.map(async (tenant: Tenant) => {
    const markets = tenant.availableMarkets.split(', ');
    matchings[tenant.id] = new Matching(buildEngines(markets), postTradeExchange, bookUpdateExchange, tenant.id);

    await Promise.all(markets.map(async (market: string) => {
      const queue = connection.declareQueue(`matching.queue.${market}.${tenant.id}`);
      
      queue.bind(exchange, `matching.key.${market}.${tenant.id}`);

      dryRun(prisma, tenant.id, market);
      console.log('ready for new orders')
      queue.activateConsumer((message) => {
        console.log('Message received: ' + message.getContent());
        const messageParsed = JSON.parse(message.getContent());
        try {
          matchings[tenant.id][messageParsed.action].call(matchings[tenant.id], messageParsed);
        } catch (e) {
          console.log(e)
        }
        message.ack();
      });
    }));
  }));
}

function buildEngines(markets: string[]): Record<string, Engine> {
  return markets.reduce((previousValue: Record<string, Engine>, currentValue: string) => {
    previousValue[currentValue] = Engine.create();
    return previousValue;
  }, {} as Record<string, Engine>)
}

async function dryRun(prisma: PrismaClient, tenantId: number, market: string) {
  const orders = await prisma.order.findMany({
    where: {
      status: Status.OPENED,
      market
    },
    orderBy: {
      id: 'desc'
    }
  });

  matchings[tenantId].dryRun = true;

  for (let order of orders) {
    order.volume = order.volume - order.tradedVolume;
    await matchings[tenantId].call({
      action: 'submit',
      order
    });
  }

  matchings[tenantId].dryRun = false;
}

bootstrap();