import { Tenant, Webhook } from '@matching-engine/prisma';
import { Body, Controller, Post, Session } from '@nestjs/common';
import { AddWebhookDto } from './dto/add-webhook.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}


  @Post()
  async create(@Body() createTenantDto: CreateTenantDto): Promise<Tenant> {
    return this.tenantsService.create(createTenantDto);
  }

  @Post('webhook')
  async addWebhook(@Body() webhookDto: AddWebhookDto, @Session() session: Tenant): Promise<Webhook> {
    return this.tenantsService.addWebhook({
      tenantId: session.id,
      ...webhookDto
    });
  }
}
