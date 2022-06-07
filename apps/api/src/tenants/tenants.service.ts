import { Prisma, Tenant, Webhook } from "@matching-engine/prisma";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenant: Prisma.TenantCreateInput): Promise<Tenant> {
    return this.prisma.tenant.create({
      data: tenant
    });
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