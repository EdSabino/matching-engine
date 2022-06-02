import { ApiProperty } from "@nestjs/swagger";

export class CreateTenantDto {
  @ApiProperty({
    description: 'Markets available on your matching engine, use the format `btcbrl, ethbrl`.',
    required: true,
  })
  availableMarkets: string;
}