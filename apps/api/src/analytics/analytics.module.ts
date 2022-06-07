import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { CacheModule, Module } from '@nestjs/common';
import { RedisClientOptions } from 'redis';
import { KLineService } from './k-line.service';
import * as redisStore from 'cache-manager-redis-store';
import { PrismaService } from 'src/prisma.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      url: 'redis://localhost:5555',
      database: 1
    }),
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        exchanges: [
          {
            name: 'postTradeExchange',
            type: 'topic',
          },
        ],
        uri: configService.get('AMQP_URL')
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AnalyticsController],
  providers: [PrismaService, AnalyticsService, KLineService],
})
export class AnalyticsModule {}

