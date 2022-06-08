import { Body, Controller, Get, Param, Post, Query, Session, UseInterceptors } from '@nestjs/common';
import { Order, Tenant } from '@matching-engine/prisma';
import { CreateLimitOrder, CreateMarketOrder, CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { TenantAuthInterceptor } from 'src/tenants/tenants-auth.interceptor';
import { OrderFilter } from './dto/orders-filter.dto';
import { ApiBody, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';

@Controller('orders')
@UseInterceptors(TenantAuthInterceptor)
@ApiExtraModels(CreateLimitOrder, CreateMarketOrder)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiBody({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(CreateLimitOrder) },
        { $ref: getSchemaPath(CreateMarketOrder) },
      ]
    },
    description: 'Create order',
  })
  async create(@Body() createOrderDto: CreateOrderDto, @Session() session: Tenant): Promise<Order> {
    return this.ordersService.create({
      tenantId: session.id,
      ...createOrderDto
    });
  }

  @Get()
  async getOrders(@Session() session: Tenant, @Query() query: OrderFilter): Promise<Order[]> {
    return this.ordersService.getOrders({
      ...query,
      status: {
        in: query.status
      },
      tenantId: session.id
    });
  }

  @Get('/books/:market')
  async getBook(@Session() session: Tenant, @Param('market') market: string): Promise<any> {
    const a = (await this.ordersService.getBooks(session.id, market)).book;
    console.log(a)
    return JSON.parse(a);
  }
}
