import { Response } from 'express'
import {
  Controller,
  Get,
  Query,
  Res,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { ReporteAdminsService } from './services/reporte-admins.service'
import { ReporteCondominiosService } from './services/reporte-condominios.service'

@Controller('reportes')
export class ReportesController {
  constructor(
    private readonly reporteAdminsService: ReporteAdminsService,
    private readonly reporteCondominiosService: ReporteCondominiosService,
  ) {}

  @Get('admins/excel')
  async reporteAdminsExcel(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Res() res: Response,
  ) {
    if (!fechaInicio || !fechaFin) {
      return res
        .status(400)
        .json({ error: 'Debe enviar fechaInicio y fechaFin' })
    }

    await this.reporteAdminsService.generarExcel(fechaInicio, fechaFin, res)
  }

  @Get('condominios/excel')
  async reporteCondominiosExcel(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Res() res: Response,
  ) {
    if (!fechaInicio || !fechaFin) {
      return res
        .status(400)
        .json({ error: 'Debe enviar fechaInicio y fechaFin' })
    }

    await this.reporteCondominiosService.generarExcel(
      fechaInicio,
      fechaFin,
      res,
    )
  }

  @Get('condominios/:id/excel-detallado')
  async reporteCondominioExcelDetallado(
    @Param('id') _id: string,
    @Res() res: Response,
  ) {
    try {
      await this.reporteCondominiosService.generarExcelDetallado(_id, res)
    } catch (error) {
      throw new HttpException(
        { message: 'Error generando reporte', details: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
}
