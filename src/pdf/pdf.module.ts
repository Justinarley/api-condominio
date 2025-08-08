import { Module } from '@nestjs/common'
import { PdfService } from './pdf.service'
import { PdfController } from './pdf.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { PagoAlicuota, PagoAlicuotaSchema } from '@/pago-alicuota/pago-alicuota.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PagoAlicuota.name, schema: PagoAlicuotaSchema },
    ]),
  ],
  providers: [PdfService],
  controllers: [PdfController],
})
export class PdfModule {}
