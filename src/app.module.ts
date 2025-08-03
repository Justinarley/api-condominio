import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { SuperAdminModule } from './super-admin/super-admin.module'
import { AdminsModule } from './admins/admins.module'
import { AuthModule } from './auth/auth.module'
import { CondominiosModule } from './condominios/condominios.module'
import { UsuariosModule } from './usuarios/usuarios.module'
import { ReportesModule } from './reportes/reportes.module'
import { DepartamentosModule } from './departamentos/departamentos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI || ''),
    SuperAdminModule,
    AdminsModule,
    AuthModule,
    CondominiosModule,
    UsuariosModule,
    ReportesModule,
    DepartamentosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
