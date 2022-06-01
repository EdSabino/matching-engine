import { OrderSide, OrderType, Status } from "@matching-engine/prisma/dist";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from 'class-transformer';
import { IsOptional } from "class-validator";

export class OrderFilter {
  @ApiProperty({
    description: 'Page to be query',
    required: false
  })
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  page: number;

  @ApiProperty({
    description: 'Page size to be query',
    required: false
  })
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  pageSize: number;

  @ApiProperty({
    description: 'Status to be included, by default get all status',
    required: false
  })
  @IsOptional()
  status: Status[];

  @ApiProperty({
    description: 'Order side to be included',
    required: false
  })
  @IsOptional()
  side: OrderSide;

  @ApiProperty({
    description: 'External ID to be filter',
    required: false
  })
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  externalId: number;

  @ApiProperty({
    description: 'The market pair to be query',
    required: false
  })
  @IsOptional()
  market: string;

  @ApiProperty({
    description: 'The order type to filter',
    required: false
  })
  @IsOptional()
  orderType: OrderType;
}