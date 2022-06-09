import { Tenant, Webhook } from '@matching-engine/prisma';
import { Body, Controller, Post, Session, UseInterceptors } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { AddWebhookDto } from './dto/add-webhook.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { TenantDto } from './dto/tenant.dto';
import { WebhookDto } from './dto/webhook.dto';
import { TenantAuthInterceptor } from './tenants-auth.interceptor';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}


  @Post()
  @ApiResponse({
    status: 200,
    type: TenantDto
  })
  @ApiResponse({
    status: 403,
  })
  async create(@Body() createTenantDto: CreateTenantDto): Promise<Tenant> {
    return this.tenantsService.create(createTenantDto);
  }

  @Post('webhook')
  @ApiResponse({
    status: 200,
    type: WebhookDto
  })
  @ApiResponse({
    status: 403,
  })
  @UseInterceptors(TenantAuthInterceptor)
  async addWebhook(@Body() webhookDto: AddWebhookDto, @Session() session: Tenant): Promise<Webhook> {
    return this.tenantsService.addWebhook({
      tenantId: session.id,
      ...webhookDto
    });
  }
}
