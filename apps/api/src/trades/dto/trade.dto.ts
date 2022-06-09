import { Trade } from "@matching-engine/prisma";
import { ApiProperty } from "@nestjs/swagger";

export class TradeDto implements Trade {
  @ApiProperty({
    description: 'Unique identifier of a single kline',
    required: true
  })
  id: number;

  @ApiProperty({
    description: 'The market pair of the trade',
    required: true
  })
  market: string;

  @ApiProperty({
    description: 'Price traded',
    required: true
  })
  price: number;

  @ApiProperty({
    description: 'Volume traded',
    required: true
  })
  volume: number;

  @ApiProperty({
    description: 'Value used on original account',
    required: true
  })
  funds: number;

  @ApiProperty({
    description: 'Id of order who was in the book.',
    required: true
  })
  makerId: number;

  @ApiProperty({
    description: 'Id of order was beeing process.',
    required: true
  })
  takerId: number;

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