import { ApiProperty } from "@nestjs/swagger";

export class AddEngineDto {
  @ApiProperty({
    description: 'The new engines that will be added to the system',
    required: true
  })
  newMarkets: string;
}