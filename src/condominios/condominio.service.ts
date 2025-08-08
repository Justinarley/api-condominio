// public-condominios.service.ts
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Condominio, CondominioDocument } from '@/condominios/condominio.schema'
import {
  Departamento,
  DepartamentoDocument,
} from '@/departamentos/departamento.schema'

@Injectable()
export class PublicCondominiosService {
  constructor(
    @InjectModel(Condominio.name)
    private condominioModel: Model<CondominioDocument>,
    @InjectModel(Departamento.name)
    private departamentoModel: Model<DepartamentoDocument>,
  ) {}

  async obtenerCondominiosConDepartamentos() {
    const condominios = await this.condominioModel
      .find()
      .select('name')
      .lean()
      .exec()

    const data = await Promise.all(
      condominios.map(async (condominio) => {
        const departamentos = await this.departamentoModel
          .find({ condominio: condominio._id, estado: 'disponible' })
          .select('codigo nombre')
          .lean()
          .exec()

        return {
          _id: condominio._id,
          name: condominio.name,
          departamentos,
        }
      }),
    )

    return data
  }
}
