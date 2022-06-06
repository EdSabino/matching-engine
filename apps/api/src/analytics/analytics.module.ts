import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { CacheModule, Module } from '@nestjs/common';
import { RedisClientOptions } from 'redis';
import { KLineService } from './k-line.service';
import * as redisStore from 'cache-manager-redis-store';
import { PrismaService } from 'src/prisma.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

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
          name: 'postTradeExchange',
          type: 'topic',
        },
      ],
      uri: 'amqp://@localhost:5672'
    }),
  ],
  controllers: [AnalyticsController],
  providers: [PrismaService, AnalyticsService, KLineService],
})
export class AnalyticsModule {}

