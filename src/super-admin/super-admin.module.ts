import { Module } from '@nestjs/common'
import { SuperAdminService } from './super-admin.service'
import { SuperAdminController } from './super-admin.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { JwtModule } from '@nestjs/jwt'
import { SuperAdmin, SuperAdminSchema } from './super-admin.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SuperAdmin.name, schema: SuperAdminSchema },
    ]),
    JwtModule
  ],
  providers: [SuperAdminService],
  controllers: [SuperAdminController],
  exports: [SuperAdminService],
})
export class SuperAdminModule {}
