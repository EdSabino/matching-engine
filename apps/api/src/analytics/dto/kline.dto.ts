import { KLine } from "@matching-engine/prisma";
import { ApiProperty } from "@nestjs/swagger";

export class KLineDto implements KLine {
  @ApiProperty({
    description: 'Unique identifier of a single kline',
    required: true
  })
  id: number;

  @ApiProperty({
    description: 'The tenant who originate it',
    required: true
  })
  tenantId: number;

  @ApiProperty({
    description: 'The market to which refers to',
    required: true
  })
  market: string;

  @ApiProperty({
    description: 'The time of the first trade registered in this kline',
    required: true
  })
  openTime: Date;

  @ApiProperty({
    description: 'The value of the first trade on the kline',
    required: true
  })
  openValue: number;

  @ApiProperty({
    description: 'The highest value hitted between the alive time fot his kline',
    required: true
  })
  highestValue: number;

  @ApiProperty({
    description: 'The lowest value hitted between the alive time fot his kline',
    required: true
  })
  lowestValue: number;

  @ApiProperty({
    description: 'The value of the last trade on the kline',
    required: true
  })
  closeValue: number;

  @ApiProperty({
    description: 'The time of the last trade registered in this kline',
    required: true
  })
  closeTime: Date;

  @ApiProperty({
    description: 'The number of trades tha happened between the alive time fot his kline',
    required: true
  })
  numberTrades: number;

  @ApiProperty({
    description: 'The volume traded between the alive time fot his kline',
    required: true
  })
  tradedVolume: number;

  @ApiProperty({
    description: 'The close time in seconds, always rounded for multiples of 5(because a new kline is created every 5 seconds, when have a new trade)',
    required: true
  })
  lastTradedSecond: number;
}