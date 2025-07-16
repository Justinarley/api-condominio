import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AdminsService } from './admins.service'
import { MongooseModule } from '@nestjs/mongoose'
import { Admin, AdminSchema } from './admin.schemas'
import { AdminsController } from './admins.controller'

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
