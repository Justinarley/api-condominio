import { Module } from '@nestjs/common'
import { PagoAlicuotaService } from './pago-alicuota.service'
import { PagoAlicuotaController } from './pago-alicuota.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { PagoAlicuota, PagoAlicuotaSchema } from './pago-alicuota.schema'
import { Departamento, DepartamentoSchema } from '@/departamentos/departamento.schema'
import { Admin, AdminSchema } from '@/admins/admin.schemas'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PagoAlicuota.name, schema: PagoAlicuotaSchema },
      { name: Departamento.name, schema: DepartamentoSchema },
      { name: Admin.name, schema: AdminSchema },
    ]),
  ],
  providers: [PagoAlicuotaService],
  controllers: [PagoAlicuotaController],
  exports: [PagoAlicuotaService, MongooseModule],
})
export class PagoAlicuotaModule {}
