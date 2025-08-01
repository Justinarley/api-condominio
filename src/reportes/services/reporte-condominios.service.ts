import * as dayjs from 'dayjs';
import { Response } from 'express'
import { Model, Types } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { fileResponse } from '@/libs/utils'
import { InjectModel } from '@nestjs/mongoose'
import { CondominioDocument } from '@/condominios/condominio.schema'

interface AdminInfo {
  name: string
  email: string
}

interface UserInfo {
  _id: Types.ObjectId
}

interface DepartamentoDetalle {
  codigo: string
  nombre: string
}

interface Torre {
  identificador: string
  departamentos: number
  departamentosDetalles: DepartamentoDetalle[]
}

interface CasaDetalle {
  codigo: string
  nombre: string
}

interface Casa {
  identificador: string
  cantidad: number
  casasDetalles: CasaDetalle[]
}

interface CondominioPoblado {
  id: string
  name: string
  address: string
  email: string
  phone: string
  tipo: 'torres' | 'casas'
  torres?: Torre[]
  casas?: Casa[]
  status: string
  adminId: AdminInfo
  users: UserInfo[]
}

@Injectable()
export class ReporteCondominiosService {
  constructor(
    @InjectModel('Condominio')
    private readonly condominioModel: Model<CondominioDocument>,
  ) {}

  async generarPorFechas(
    fechaInicio: string,
    fechaFin: string,
  ): Promise<CondominioPoblado[]> {
    const desde = new Date(fechaInicio)
    const hasta = new Date(fechaFin)

    return this.condominioModel
      .find({ createdAt: { $gte: desde, $lte: hasta } })
      .populate('adminId', 'name email')
      .populate('users', '_id')
      .exec() as unknown as Promise<CondominioPoblado[]>
  }

  async generarExcel(fechaInicio: string, fechaFin: string, res: Response) {
    const startDate = dayjs(fechaInicio, 'YYYY-MM-DD')
    const endDate = dayjs(fechaFin, 'YYYY-MM-DD')

    const condominios = await this.generarPorFechas(
      startDate.toISOString(),
      endDate.toISOString(),
    )

    const condominiosFormateados = condominios.map((condo, i) => ({
      index: i + 1,
      id: condo.id,
      name: condo.name,
      address: condo.address,
      email: condo.email,
      phone: condo.phone,
      tipo: condo.tipo,
      status: condo.status === 'active' ? 'Activado' : 'Inactivo',
      admin: `${condo.adminId?.name || ''} (${condo.adminId?.email || ''})`,
      totalUsuarios: condo.users?.length || 0,
      cantidadTorres: condo.tipo === 'torres' ? condo.torres?.length || 0 : '-',
      cantidadCasas: condo.tipo === 'casas' ? condo.casas?.length || 0 : '-',
    }))

    const other = {
      startDate: startDate.format('DD-MM-YYYY'),
      endDate: endDate.format('DD-MM-YYYY'),
      generationDate: dayjs().format('DD-MM-YYYY HH:mm:ss'),
    }

    const data = {
      condominios: condominiosFormateados,
      other,
    }

    const path = '@/assets/plantillas/superadmin-condo-report-plantillas.xlsx'
    const filename = `reporte-condominios-${startDate.format('DD-MM-YYYY')}-al-${endDate.format('DD-MM-YYYY')}.xlsx`

    await fileResponse({ res, data, path, filename })
  }

  async generarExcelDetallado(_id: string, res: Response) {
    const condominio = (await this.condominioModel
      .findOne({ _id })
      .populate('adminId', 'name email')
      .populate('users', '_id')
      .exec()) as CondominioPoblado | null

    if (!condominio) throw new Error('Condominio no encontrado')

    const rows: any[] = []

    const infoBase = {
      id: condominio.id,
      name: condominio.name,
      address: condominio.address,
      email: condominio.email,
      phone: condominio.phone,
      tipo: condominio.tipo,
      status: condominio.status === 'active' ? 'Activado' : 'Inactivo',
      admin: `${condominio.adminId?.name || ''} (${condominio.adminId?.email || ''})`,
      totalUsuarios: condominio.users?.length || 0,
      cantidadTorres:
        condominio.tipo === 'torres' ? condominio.torres?.length || 0 : '-',
      cantidadCasas:
        condominio.tipo === 'casas' ? condominio.casas?.length || 0 : '-',
    }

    if (condominio.tipo === 'torres') {
      condominio.torres?.forEach((torre) => {
        torre.departamentosDetalles?.forEach((dep) => {
          rows.push({
            ...infoBase,
            tipoUnidad: 'Torre',
            identificador: torre.identificador,
            cantidad: torre.departamentos,
            codigo: dep.codigo,
            nombreUnidad: dep.nombre,
          })
        })
      })
    }

    if (condominio.tipo === 'casas') {
      condominio.casas?.forEach((casa) => {
        casa.casasDetalles?.forEach((detalle) => {
          rows.push({
            ...infoBase,
            tipoUnidad: 'Casa',
            identificador: casa.identificador,
            cantidad: casa.cantidad,
            codigo: detalle.codigo,
            nombreUnidad: detalle.nombre,
          })
        })
      })
    }

    const data = {
      detalles: rows,
      other: {
        generationDate: dayjs().format('DD-MM-YYYY HH:mm:ss'),
        condominioNombre: condominio.name,
      },
    }

    const path = '@/assets/plantillas/superadmin-condo-detallado-report.xlsx'
    const filename = `reporte-detallado-condominio-${condominio.id}.xlsx`

    await fileResponse({ res, data, path, filename })
  }
}
