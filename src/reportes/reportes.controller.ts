import { Response } from 'express'
import { Controller, Post, Body, Res } from '@nestjs/common'
import { ReporteAdminsService } from './services/reporte-admins.service'

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reporteAdminsService: ReporteAdminsService) {}
  @Post('admins/excel')
  async reporteAdminsExcel(
    @Body() body: { fechaInicio: string; fechaFin: string },
    @Res() res: Response,
  ) {
    const { fechaInicio, fechaFin } = body

    if (!fechaInicio || !fechaFin) {
      return res
        .status(400)
        .json({ error: 'Debe enviar fechaInicio y fechaFin' })
    }

    await this.reporteAdminsService.generarExcel(fechaInicio, fechaFin, res)
  }
}
