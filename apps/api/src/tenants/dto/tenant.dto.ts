import { Tenant } from "@matching-engine/prisma/dist/src";
import { ApiProperty } from "@nestjs/swagger";
import { CreateTenantDto } from "./create-tenant.dto";

export class TenantDto extends CreateTenantDto implements Tenant {
  @ApiProperty({
    description: 'Unique identifier of the tenant',
    required: true
  })
  id: number;

  @ApiProperty({
    description: 'Uuid to be used on all requests',
    required: true
  })
  accessUuid: string;
}