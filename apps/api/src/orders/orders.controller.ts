import { Body, Controller, Get, Param, Post, Query, Session, UseInterceptors } from '@nestjs/common';
import { Order, Tenant } from '@matching-engine/prisma';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { Books } from './dto/books.dto';
import { TenantAuthInterceptor } from 'src/tenants/tenants-auth.interceptor';
import { OrderFilter } from './dto/orders-filter.dto';

@Controller('orders')
@UseInterceptors(TenantAuthInterceptor)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
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
  async getBook(@Session() session: Tenant, @Param('market') market: string): Promise<Books> {
    return this.ordersService.getBooks(session.id, market);
  }
}
