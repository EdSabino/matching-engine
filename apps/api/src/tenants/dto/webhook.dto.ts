import { Webhook } from "@matching-engine/prisma/dist/src";
import { ApiProperty } from "@nestjs/swagger";
import { AddWebhookDto } from "./add-webhook.dto";

export class WebhookDto extends AddWebhookDto implements Webhook {
  @ApiProperty({
    description: 'Unique identifier of the tenant',
    required: true
  })
  id: number;

  @ApiProperty({
    description: 'The tenant who originate it',
    required: true
  })
  tenantId: number;
}