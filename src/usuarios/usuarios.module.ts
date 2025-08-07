import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { UsuariosService } from './usuarios.service'
import { User, UserSchema } from './usuarios.schema'
import { UsuariosController } from './usuarios.controller'
import {
  Departamento,
  DepartamentoSchema,
} from '@/departamentos/departamento.schema'
import { Condominio, CondominioSchema } from '@/condominios/condominio.schema'
import {
  PagoAlicuota,
  PagoAlicuotaSchema,
} from '@/pago-alicuota/pago-alicuota.schema'
import { PagoAlicuotaModule } from '@/pago-alicuota/pago-alicuota.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Departamento.name, schema: DepartamentoSchema },
      { name: Condominio.name, schema: CondominioSchema },
      { name: PagoAlicuota.name, schema: PagoAlicuotaSchema },
    ]),
    PagoAlicuotaModule,
  ],
  providers: [UsuariosService],
  controllers: [UsuariosController],
  exports: [UsuariosService, MongooseModule],
})
export class UsuariosModule {}
