import { Tenant, Webhook } from '@matching-engine/prisma';
import { Body, Controller, Post, Session, UseInterceptors } from '@nestjs/common';
import { AddWebhookDto } from './dto/add-webhook.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { TenantAuthInterceptor } from './tenants-auth.interceptor';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}


  @Post()
  async create(@Body() createTenantDto: CreateTenantDto): Promise<Tenant> {
    return this.tenantsService.create(createTenantDto);
  }

  @Post('webhook')
  @UseInterceptors(TenantAuthInterceptor)
  async addWebhook(@Body() webhookDto: AddWebhookDto, @Session() session: Tenant): Promise<Webhook> {
    return this.tenantsService.addWebhook({
      tenantId: session.id,
      ...webhookDto
    });
  }
}
