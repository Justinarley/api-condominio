import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { UsuariosService } from './usuarios.service'
import { User, UserSchema } from './usuarios.schema'
import { UsuariosController } from './usuarios.controller'
import { Departamento, DepartamentoSchema } from '@/departamentos/departamento.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Departamento.name, schema: DepartamentoSchema },
    ]),
  ],
  providers: [UsuariosService],
  controllers: [UsuariosController],
  exports: [UsuariosService, MongooseModule],
})
export class UsuariosModule {}
