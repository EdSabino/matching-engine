import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PostTradeService } from './post-trade.service';
import { UpdateBookService } from './update-book.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
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
        uri: configService.get('AMQP_URL')
      }),
      inject: [ConfigService],
    }),
    HttpModule,
    OrdersModule
  ],
  controllers: [OrdersController],
  providers: [PrismaService, OrdersService, PostTradeService, UpdateBookService],
})
export class OrdersModule {}
