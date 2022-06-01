import { ApiProperty } from "@nestjs/swagger";
import { OrderSide, OrderType } from "@matching-engine/prisma";
import { IsNotEmpty } from "class-validator";

export class CreateOrderDto {
  @ApiProperty({
    description: 'The market pair of the order',
    required: true
  })
  @IsNotEmpty()
  market: string;

  @ApiProperty({
    description: 'Side of the order',
    enum: OrderSide,
    required: true
  })
  @IsNotEmpty()
  side: OrderSide;

  @ApiProperty({
    description: 'Type of the order',
    enum: OrderType,
    required: true
  })
  @IsNotEmpty()
  orderType: OrderType;

  @ApiProperty({
    description: 'Volume that should be traded',
    required: true
  })
  @IsNotEmpty()
  volume: number;

  @ApiProperty({
    description: 'Price that should be traded',
    required: true
  })
  price: number;
}