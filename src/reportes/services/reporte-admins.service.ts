import * as dayjs from 'dayjs';
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Response } from 'express'
import { AdminDocument } from '@/admins/admin.schemas'
import { fileResponse } from '@/libs/utils'

@Injectable()
export class ReporteAdminsService {
  constructor(
    @InjectModel('Admin')
    private readonly adminModel: Model<AdminDocument>,
  ) {}

  async generarPorFechas(fechaInicio: string, fechaFin: string) {
    const desde = new Date(fechaInicio)
    const hasta = new Date(fechaFin)
    return this.adminModel
      .find({ createdAt: { $gte: desde, $lte: hasta } })
      .populate('condominios', 'id name')
      .lean()
      .exec()
  }

  async generarExcel(fechaInicio: string, fechaFin: string, res: Response) {
    const startDate = dayjs(fechaInicio, 'YYYY-MM-DD')
    const endDate = dayjs(fechaFin, 'YYYY-MM-DD')
    const admins = await this.generarPorFechas(
      startDate.toISOString(),
      endDate.toISOString(),
    )
    const adminsFormateados = admins.map((admin: any, i: number) => ({
      index: i + 1,
      identification: admin.identification,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      address: admin.address,
      status: admin.status,
      role: admin.role,
      condominios: (admin.condominios || [])
        .map((c: any) => `${c.id} - ${c.name}`)
        .join(', '),
    }))

    const other = {
      startDate: startDate.format('DD-MM-YYYY'),
      endDate: endDate.format('DD-MM-YYYY'),
      generationDate: dayjs().format('DD-MM-YYYY HH:mm:ss'),
    }

    const data = { admins: adminsFormateados, other }
    const path = '@/assets/plantillas/superadmin-admins-report-plantillas.xlsx'
    const filename = `reporte-admins-${startDate.format('DD-MM-YYYY')}-al-${endDate.format('DD-MM-YYYY')}.xlsx`

    await fileResponse({ res, data, path, filename })
  }
}
