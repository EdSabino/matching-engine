import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional } from "class-validator";

export class TradesFilter {
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
    description: 'The market pair to be query',
    required: false
  })
  @IsOptional()
  market: string;

  @ApiProperty({
    description: 'The oldest date-time to be filter',
    required: false
  })
  @IsOptional()
  createdAt: Date;
}