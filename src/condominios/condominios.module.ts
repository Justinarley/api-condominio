import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CondominiosService } from './condominios.service'
import { CondominiosController } from './condominios.controller'
import { Condominio, CondominioSchema } from './condominio.schema'
import { Admin, AdminSchema } from '@/admins/admin.schemas'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Condominio.name, schema: CondominioSchema },
      { name: Admin.name, schema: AdminSchema },
    ]),
  ],
  providers: [CondominiosService],
  controllers: [CondominiosController],
})
export class CondominiosModule {}
