import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, Max } from "class-validator";

export class KLineFilters {
  @ApiProperty({
    description: 'The market to be queried',
    required: true
  })
  @IsNotEmpty()
  market: string;

  @ApiProperty({
    description: 'The start time of the search',
    required: false
  })
  @IsOptional()
  startTime: Date;

  @ApiProperty({
    description: 'The start time of the search',
    required: false
  })
  @IsOptional()
  endTime: Date;

  @ApiProperty({
    description: 'The start time of the search',
    default: 100,
    maximum: 500,
    required: false
  })
  @Max(500)
  @IsOptional()
  limit: number = 100;

  get lastTradedSecond() {
    if (!this.endTime && !this.startTime) {
      return {};
    }
    return {
      gte: this.startTime ? this.startTime.getTime() / 1000 : null,
      lte: this.endTime ? this.endTime.getTime() / 1000 : null
    }
  }
}