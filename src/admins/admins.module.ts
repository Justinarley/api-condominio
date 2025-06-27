import { Module } from '@nestjs/common'
import { AdminsService } from './admins.service'
import { AdminsController } from './admins.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Admin, AdminSchema } from './admin.schemas'
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    JwtModule,
  ],
  providers: [AdminsService],
  controllers: [AdminsController],
  exports: [AdminsService],
})
export class AdminsModule {}
