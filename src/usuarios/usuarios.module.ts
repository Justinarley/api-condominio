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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Departamento.name, schema: DepartamentoSchema },
       { name: Condominio.name, schema: CondominioSchema },
    ]),
  ],
  providers: [UsuariosService],
  controllers: [UsuariosController],
  exports: [UsuariosService, MongooseModule],
})
export class UsuariosModule {}
