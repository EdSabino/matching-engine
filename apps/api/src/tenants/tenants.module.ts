import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

@Module({
  imports: [],
  controllers: [TenantsController],
  providers: [PrismaService, TenantsService],
})
export class TenantsModule {}
