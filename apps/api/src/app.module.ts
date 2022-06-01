import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { TenantsModule } from './tenants/tenants.module';
import { TradesModule } from './trades/trades.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'newOrdersExchange',
          type: 'direct',
        },
      ],
      uri: 'amqp://@localhost:5672'
    }),
    OrdersModule,
    TenantsModule,
    TradesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
