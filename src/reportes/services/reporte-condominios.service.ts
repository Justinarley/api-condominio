import * as dayjs from 'dayjs'
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
  areasComunes?: {
    nombre: string
    estado: 'libre' | 'ocupado'
    descripcion?: string
    capacidad?: number
  }[]
  departamentos?: UserInfo[]
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
      .populate('departamentos')
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
      tipo: condo.tipo === 'torres' ? 'Torre' : 'Casa',
      status: condo.status === 'active' ? 'Activado' : 'Inactivo',
      admin: `${condo.adminId?.name || ''} (${condo.adminId?.email || ''})`,
      totalDepartamentos: condo.departamentos?.length || 0,
      areasComunes: condo.areasComunes
        ? condo.areasComunes.map((area) => area.nombre).join(', ')
        : 'N/A',
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
      .populate({
        path: 'departamentos',
        populate: {
          path: 'propietario',
          select: 'name email', // si quieres incluir info del propietario
        },
      })
      .exec()) as CondominioPoblado | null

    if (!condominio) throw new Error('Condominio no encontrado')

    const infoBase = {
      id: condominio.id,
      name: condominio.name,
      address: condominio.address,
      email: condominio.email,
      phone: condominio.phone,
      tipo: condominio.tipo === 'torres' ? 'Torre' : 'Casa',
      status: condominio.status === 'active' ? 'Activado' : 'Inactivo',
      admin: condominio.adminId
        ? `${condominio.adminId.name} (${condominio.adminId.email})`
        : 'N/A',
      totalDepartamentos: condominio.departamentos?.length || 0,
    }

    const rows = (condominio.departamentos || []).map((dep: any) => ({
      ...infoBase,
      identificador: dep.grupo || '-',
      codigoDepartamento: dep.codigo,
      nombreDepartamento: dep.nombre,
      estadoDepartamento: dep.estado === 'disponible' ? 'Disponible' : 'Ocupado',
      propietario:
        dep.propietario && dep.propietario.name
          ? `${dep.propietario.name} (${dep.propietario.email || 'sin email'})`
          : 'No asignado',
    }))

    if (rows.length === 0) {
      rows.push({
        ...infoBase,
        identificador: '-',
        codigoDepartamento: '-',
        nombreDepartamento: '-',
        estadoDepartamento: '-',
        propietario: '-',
      })
    }

    const areasComunesTexto = condominio.areasComunes?.length
      ? condominio.areasComunes
          .map(
            (area) =>
              `${area.nombre} (Estado: ${area.estado}, Capacidad: ${area.capacidad ?? 'N/A'}, Descripción: ${
                area.descripcion ?? 'N/A'
              })`,
          )
          .join('; ')
      : 'N/A'

    const data = {
      detalles: rows,
      other: {
        generationDate: dayjs().format('DD-MM-YYYY HH:mm:ss'),
        condominioNombre: condominio.name,
        totalDepartamentos: infoBase.totalDepartamentos,
        areasComunes: areasComunesTexto,
        admin: infoBase.admin,
      },
    }

    const path = '@/assets/plantillas/superadmin-condo-detallado-report.xlsx'
    const filename = `reporte-detallado-condominio-${condominio.id}.xlsx`

    await fileResponse({ res, data, path, filename })
  }
}
