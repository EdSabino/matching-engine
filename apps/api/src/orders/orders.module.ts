import type { RedisClientOptions } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { CacheModule, Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PostTradeService } from './post-trade.service';
import { UpdateBookService } from './update-book.service';

@Module({
  imports: [
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      url: 'redis://localhost:5555',
      database: 1
    }),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'newOrdersExchange',
          type: 'direct',
        },
        {
          name: 'postTradeExchange',
          type: 'topic',
        },
      ],
      uri: 'amqp://@localhost:5672'
    }),
    OrdersModule
  ],
  controllers: [OrdersController],
  providers: [PrismaService, OrdersService, PostTradeService, UpdateBookService],
})
export class OrdersModule {}

