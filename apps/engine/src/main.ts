import 'dotenv/config';
import { PrismaClient, Status, Tenant } from '@matching-engine/prisma';
import * as Amqp from 'amqp-ts';
import { Engine } from './engine/engine';
import { Matching } from './matching';
import * as express from 'express';
import { Router, Request, Response } from 'express';

const app = express();

const route = Router();

app.use(express.json());

route.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello world!' });
});

app.use(route);

const matchings = {};

async function bootstrap() {
  const prisma = new PrismaClient();
  const tenants = await prisma.tenant.findMany();
  const connection = new Amqp.Connection(process.env.AMQP_URL);
  await connection.completeConfiguration();
  const exchange = connection.declareExchange('newOrdersExchange');
  const postTradeExchange = connection.declareExchange('postTradeExchange', 'topic');
  const bookUpdateExchange = connection.declareExchange('bookUpdateExchange', 'topic');
  const newTenantExchange = connection.declareExchange('newTenantExchange');

  const queue = connection.declareQueue(`tenant.new`);
  queue.bind(newTenantExchange, `tenant.new`);
  queue.activateConsumer((message) => {
    const messageParsed = JSON.parse(message.getContent());
    try {
      createMatchingEngineForTenant(
        messageParsed['tenant'] as Tenant,
        postTradeExchange,
        bookUpdateExchange,
        exchange,
        connection,
        prisma
      )
    } catch (e) {
      console.log(e)
    }
    message.ack();
  });

  await Promise.all(tenants.map((tenant: Tenant) => createMatchingEngineForTenant(
    tenant,
    postTradeExchange,
    bookUpdateExchange,
    exchange,
    connection,
    prisma
  )));
}

async function createMatchingEngineForTenant(
  tenant: Tenant,
  postTradeExchange: Amqp.Exchange,
  bookUpdateExchange: Amqp.Exchange,
  exchange: Amqp.Exchange,
  connection: Amqp.Connection,
  prisma: PrismaClient
) {
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
    await matchings[tenantId].submit({
      action: 'submit',
      order
    });
  }

  matchings[tenantId].dryRun = false;
}

bootstrap();
app.listen(process.env.PORT, () => console.log('server running on port 3000'));
