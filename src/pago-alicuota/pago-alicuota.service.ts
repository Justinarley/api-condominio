import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { PagoAlicuota, PagoAlicuotaDocument } from './pago-alicuota.schema'
import { CreatePagoDto } from './dto/pago-alicuota'
import {
  Departamento,
  DepartamentoDocument,
} from '@/departamentos/departamento.schema'
import { Admin, AdminDocument } from '@/admins/admin.schemas'

@Injectable()
export class PagoAlicuotaService {
  constructor(
    @InjectModel(PagoAlicuota.name)
    private readonly pagoModel: Model<PagoAlicuotaDocument>,
    @InjectModel(Departamento.name)
    private readonly departamentoModel: Model<DepartamentoDocument>,

    @InjectModel(Admin.name)
    private readonly adminModel: Model<AdminDocument>,
  ) {}

  // Crear un nuevo pago
  async create(dto: CreatePagoDto) {
    return this.pagoModel.create({
      ...dto,
      fechaPago: new Date(),
    })
  }

  // Buscar pagos por departamento
  async findByDepartamento(departamentoId: string) {
    return this.pagoModel.find({ departamento: departamentoId }).exec()
  }

  // Buscar pagos por mes
  async findByMes(mes: string) {
    return this.pagoModel.find({ mes }).exec()
  }

  // Buscar pagos por departamento y estado (estado es opcional)
  async findByDepartamentoYEstado(departamentoId: string, estado?: string) {
    const filtro: any = { departamento: departamentoId }
    if (estado) {
      filtro.estado = estado
    }
    return this.pagoModel.find(filtro).exec()
  }

  // Buscar pagos hechos por un usuario (propietario)
  async findByUsuario(usuarioId: string) {
    return this.pagoModel.find({ pagadoPor: usuarioId }).exec()
  }

  async findPagosPendientes(adminId: string) {
    // Obtener admin con sus condominios
    const admin = await this.adminModel.findById(adminId).exec()
    if (!admin) {
      throw new NotFoundException('Admin no encontrado')
    }

    const condominiosAdmin = admin.condominios || []

    // Buscar departamentos que pertenezcan a esos condominios
    const departamentos = await this.departamentoModel
      .find({ condominio: { $in: condominiosAdmin } })
      .select('_id')
      .exec()

    if (!departamentos || departamentos.length === 0) {
      return []
    }

    const departamentosIds = departamentos.map((d) => d._id)

    // Buscar pagos pendientes solo en esos departamentos
    const pagosPendientes = await this.pagoModel
      .find({ estado: 'pendiente', departamento: { $in: departamentosIds } })
      .populate({
        path: 'departamento',
        select: 'codigo nombre condominio',
        populate: { path: 'condominio', select: 'name id' },
      })
      .populate({ path: 'pagadoPor', select: 'name email' })
      .exec()

    return pagosPendientes
  }

  async actualizarEstadoPago(
    pagoId: string,
    nuevoEstado: 'pendiente' | 'pagado' | 'rechazado',
  ) {
    const pago = await this.pagoModel.findById(pagoId)
    if (!pago) {
      throw new Error('Pago no encontrado')
    }
    pago.estado = nuevoEstado
    return pago.save()
  }

  async findPagosPorAdmin(adminId: string) {
    const admin = await this.adminModel.findById(adminId).exec()
    if (!admin) {
      console.log('>>> Admin no encontrado')
      throw new NotFoundException('Admin no encontrado')
    }
    const condominiosAdmin = admin.condominios
    if (!condominiosAdmin || condominiosAdmin.length === 0) {
      console.log('>>> Admin no tiene condominios asignados')
      return []
    }
    const departamentos = await this.departamentoModel
      .find({ condominio: { $in: condominiosAdmin } })
      .select('_id')
      .exec()
    console.log('>>> Departamentos encontrados:', departamentos.length)
    if (!departamentos || departamentos.length === 0) {
      console.log('>>> No hay departamentos para los condominios del admin')
      return []
    }

    const departamentosIds = departamentos.map((d) => d._id)

    const pagos = await this.pagoModel
      .find({ departamento: { $in: departamentosIds } })
      .populate({
        path: 'departamento',
        select: 'codigo nombre condominio',
        populate: { path: 'condominio', select: 'name' },
      })
      .populate({ path: 'pagadoPor', select: 'name email' })
      .exec()
    return pagos
  }

  async findPagoPorMes(
    userId: string,
    departamentoId: string,
    mes: string,
  ): Promise<PagoAlicuota | null> {
    return this.pagoModel.findOne({
      pagadoPor: userId,
      departamento: departamentoId,
      mes,
    })
  }
}
