import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Acceso, AccesoDocument } from './acceso.schema'

@Injectable()
export class AccesosService {
  constructor(
    @InjectModel(Acceso.name)
    private accesoModel: Model<AccesoDocument>,
  ) {}

  // Crear nuevo acceso

  async crearAcceso(data: Partial<Acceso>) {
    // Convierte strings a ObjectId para los campos referenciados
    if (typeof data.departamento === 'string') {
      data.departamento = new Types.ObjectId(data.departamento)
    }
    if (typeof data.condominio === 'string') {
      data.condominio = new Types.ObjectId(data.condominio)
    }
    if (typeof data.guardia === 'string') {
      data.guardia = new Types.ObjectId(data.guardia)
    }
    const nuevoAcceso = new this.accesoModel(data)
    return nuevoAcceso.save()
  }

  // Listar accesos filtrados por condominio
  async listarPorCondominio(condominioId: string): Promise<Acceso[]> {
    return this.accesoModel
      .find({ condominio: new Types.ObjectId(condominioId) })
      .populate('departamento')
      .populate('guardia', 'name email')
      .sort({ horaEntrada: -1 })
      .exec()
  }

  // Actualizar solo horaSalida
  async registrarSalida(id: string, horaSalida: Date): Promise<Acceso> {
    const acceso = await this.accesoModel.findById(id)
    if (!acceso) {
      throw new NotFoundException('Acceso no encontrado')
    }

    acceso.horaSalida = horaSalida
    return acceso.save()
  }

  async contarAccesosYVehiculos(condominioId: string) {
    const condominioObjectId = new Types.ObjectId(condominioId)
    const hoyInicio = new Date()
    hoyInicio.setHours(0, 0, 0, 0)
    const hoyFin = new Date()
    hoyFin.setHours(23, 59, 59, 999)

    // Conteo total accesos hoy (sin filtro de vehículo)
    const totalAccesos = await this.accesoModel.countDocuments({
      condominio: condominioObjectId,
      horaEntrada: { $gte: hoyInicio, $lte: hoyFin },
    })

    // Conteo accesos con vehículo registrado hoy
    const totalVehiculos = await this.accesoModel.countDocuments({
      condominio: condominioObjectId,
      horaEntrada: { $gte: hoyInicio, $lte: hoyFin },
      'vehiculo.placa': { $exists: true, $ne: '' },
      horaSalida: { $exists: false },
    })

    return {
      totalAccesos,
      totalVehiculos,
    }
  }

  async listarVehiculosActivos(condominioId: string): Promise<Acceso[]> {
    const condominioObjectId = new Types.ObjectId(condominioId)

    return this.accesoModel
      .find({
        condominio: condominioObjectId,
        'vehiculo.placa': { $exists: true, $ne: '' },
        horaSalida: { $exists: false },
      })
      .populate('guardia', 'name email')
      .sort({ horaEntrada: -1 })
      .exec()
  }
}
