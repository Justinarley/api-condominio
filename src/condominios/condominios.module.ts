import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CondominiosService } from './condominios.service'
import { CondominiosController } from './condominios.controller'
import { Condominio, CondominioSchema } from './condominio.schema'
import { Admin, AdminSchema } from '@/admins/admin.schemas'
import { DepartamentosModule } from '@/departamentos/departamentos.module'
import { PublicCondominiosController } from './condominio.controller'
import { PublicCondominiosService } from './condominio.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Condominio.name, schema: CondominioSchema },
      { name: Admin.name, schema: AdminSchema },
    ]),
    DepartamentosModule,
  ],
  providers: [CondominiosService, PublicCondominiosService],
  controllers: [CondominiosController, PublicCondominiosController],
  exports: [MongooseModule],
})
export class CondominiosModule {}
