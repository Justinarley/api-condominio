import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { UsuariosService } from './usuarios.service'
import { User, UserSchema } from './usuarios.schema'
import { UsuariosController } from './usuarios.controller'
import { Condominio, CondominioSchema } from '@/condominios/condominio.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Condominio.name, schema: CondominioSchema },
    ]),
  ],
  providers: [UsuariosService],
  controllers: [UsuariosController],
  exports: [UsuariosService],
})
export class UsuariosModule {}
