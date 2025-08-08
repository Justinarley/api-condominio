import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  UseGuards,
} from '@nestjs/common'
import { Response } from 'express'
import { PdfService } from './pdf.service'
import { Roles } from '@/auth/decoradors/roles.decorator'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { RolesGuard } from '@/auth/guards/roles.guard'

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('propietario')
  @Get('recibo/:id')
  async getReciboPdf(@Param('id') id: string, @Res() res: Response) {
    console.log(`Petición recibida para PDF recibo ID: ${id}`)
    const pdfBuffer = await this.pdfService.generarReciboDesdePago(id)

    if (!pdfBuffer) {
      return res.status(404).send('Recibo no encontrado')
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=recibo-${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    })

    res.end(pdfBuffer)
  }
}
