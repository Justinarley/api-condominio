import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AdminsService } from './admins.service'
import { MongooseModule } from '@nestjs/mongoose'
import { Admin, AdminSchema } from './admin.schemas'
import { AdminsController } from './admins.controller'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { CondominiosModule } from '@/condominios/condominios.module'
import { DepartamentosModule } from '@/departamentos/departamentos.module'
import { UsuariosModule } from '@/usuarios/usuarios.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    JwtModule,
    CondominiosModule,
    DepartamentosModule,
    UsuariosModule
  ],
  providers: [AdminsService, AdminService],
  controllers: [AdminsController, AdminController],
  exports: [AdminsService],
})
export class AdminsModule {}
