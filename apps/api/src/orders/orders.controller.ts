import { Body, Controller, Get, Param, Post, Put, Query, Session, UseInterceptors } from '@nestjs/common';
import { Order, Tenant } from '@matching-engine/prisma';
import { CreateLimitOrder, CreateMarketOrder, CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { TenantAuthInterceptor } from 'src/tenants/tenants-auth.interceptor';
import { OrderFilter } from './dto/orders-filter.dto';
import { ApiBody, ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { OrderDto } from './dto/order.dto';
import { Books } from './dto/books.dto';

@Controller('orders')
@UseInterceptors(TenantAuthInterceptor)
@ApiExtraModels(CreateLimitOrder, CreateMarketOrder)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiResponse({
    status: 200,
    type: OrderDto
  })
  @ApiResponse({
    status: 403,
  })
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

  @Put('/cancel/:id')
  @ApiResponse({
    status: 200,
    type: OrderDto
  })
  @ApiResponse({
    status: 403,
  })
  async cancel(@Session() session: Tenant, @Param('id') id: string): Promise<Order> {
    return this.ordersService.cancelOrderById(parseInt(id), session.id);
  }

  @Get()
  @ApiResponse({
    status: 200,
    type: OrderDto
  })
  @ApiResponse({
    status: 403,
  })
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
  @ApiResponse({
    status: 200,
    type: Books
  })
  @ApiResponse({
    status: 403,
  })
  async getBook(@Session() session: Tenant, @Param('market') market: string): Promise<Books> {
    return JSON.parse((await this.ordersService.getBooks(session.id, market)).book);
  }
}
