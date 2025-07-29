import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ReportesController } from './reportes.controller'
import { Admin, AdminSchema } from '@/admins/admin.schemas'
import { ReporteAdminsService } from './services/reporte-admins.service'
import { ReporteCondominiosService } from './services/reporte-condominios.service'
import { Condominio, CondominioSchema } from '@/condominios/condominio.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: Condominio.name, schema: CondominioSchema },
    ]),
  ],
  controllers: [ReportesController],
  providers: [ReporteAdminsService, ReporteCondominiosService],
})
export class ReportesModule {}
