import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { Prisma, Tenant, Webhook } from "@matching-engine/prisma";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService, private readonly amqpConnection: AmqpConnection) {}

  async create(tenantArgs: Prisma.TenantCreateInput): Promise<Tenant> {
    const tenant = await this.prisma.tenant.create({
      data: tenantArgs
    });

    this.amqpConnection.publish(
      'newTenantExchange',
      `tenant.new`,
      {
        tenant
      }
    );

    return tenant;
  }

  async createEngines(tenant: Tenant, newMarkets: string): Promise<Tenant> {
    const updatedTenant = await this.prisma.tenant.update({
      data: {
        availableMarkets: `${tenant.availableMarkets}, ${newMarkets}`
      },
      where: {
        id: tenant.id
      }
    });

    this.amqpConnection.publish(
      'newTenantExchange',
      `tenant.engine.new`,
      {
        tenant: updatedTenant,
        newMarkets
      }
    );

    return updatedTenant;
  }

  async addWebhook(webhookArgs: Prisma.WebhookUncheckedCreateInput): Promise<Webhook> {
    const webhook = await this.prisma.webhook.findFirst({
      where: {
        tenantId: webhookArgs.tenantId,
        action: webhookArgs.action
      }
    });

    if (webhook) {
      return this.prisma.webhook.update({
        data: {
          action: webhookArgs.action,
          fullAddress: webhookArgs.fullAddress
        },
        where: {
          tenantId_action: {
            tenantId: webhookArgs.tenantId,
            action: webhookArgs.action
          }
        }
      });
    }

    return this.prisma.webhook.create({
      data: webhookArgs
    });
  }
}