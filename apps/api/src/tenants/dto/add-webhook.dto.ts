import { WebhookAction } from "@matching-engine/prisma";
import { ApiProperty } from "@nestjs/swagger";

export class AddWebhookDto {
  @ApiProperty({
    description: 'The address to where the webhook will be send.',
    required: true,
  })
  fullAddress: string;

  @ApiProperty({
    description: 'The possible actions to invoke the webhook',
    required: true,
    enum: WebhookAction
  })
  action: WebhookAction;
}