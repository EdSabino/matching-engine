import { Order, Status } from "@matching-engine/prisma";
import { ApiProperty } from "@nestjs/swagger";
import { CreateLimitOrder } from "./create-order.dto";

export class OrderDto extends CreateLimitOrder implements Order {
  @ApiProperty({
    description: 'Unique identifier of a single kline',
    required: true
  })
  id: number;

  @ApiProperty({
    description: 'The expected value to be locked from original account',
    required: true
  })
  locked: number;

  @ApiProperty({
    description: 'Status of the Order',
    enum: Status,
    required: true
  })
  status: Status;

  @ApiProperty({
    description: 'How much of volume was traded',
    required: true
  })
  tradedVolume: number;

  @ApiProperty({
    description: 'In how many trades this order appears',
    required: true
  })
  tradesCount: number;

  @ApiProperty({
    description: 'The tenant who originate it',
    required: true
  })
  tenantId: number;

  @ApiProperty({
    description: 'The time in which this order was created',
    required: true
  })
  createdAt: Date;
}