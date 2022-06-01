import { ApiProperty } from "@nestjs/swagger";

export class Books {
  @ApiProperty({
    description: 'The books with the accumulated ask orders',
    required: true
  })
  ask: number[][];

  @ApiProperty({
    description: 'The books with the accumulated bid orders',
    required: true
  })
  bid: number[][];
}