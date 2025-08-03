// departamentos.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Departamento, DepartamentoDocument } from './departamento.schema'
import { Model, Types } from 'mongoose'
import { CreateDepartamentoDto, UpdateDepartamentoDto } from './dto/departamento.dto'

@Injectable()
export class DepartamentosService {
  constructor(
    @InjectModel(Departamento.name)
    private readonly model: Model<DepartamentoDocument>,
  ) {}

  async create(dto: CreateDepartamentoDto): Promise<DepartamentoDocument> {
    const departamento = new this.model(dto)
    return departamento.save()
  }

  async findByCondominio(condominioId: string): Promise<DepartamentoDocument[]> {
    return this.model
      .find({ condominio: condominioId })
      .populate('propietario', 'name email')
      .exec()
  }

  async update(id: string, dto: UpdateDepartamentoDto): Promise<DepartamentoDocument> {
    const departamento = await this.model.findById(id)
    if (!departamento) throw new NotFoundException('Departamento no encontrado')

    if (dto.estado && ['ocupado', 'disponible', 'mantenimiento'].includes(dto.estado)) {
      departamento.estado = dto.estado as 'ocupado' | 'disponible' | 'mantenimiento'
    }
    if (dto.propietario) departamento.propietario = new Types.ObjectId(dto.propietario)

    return departamento.save()
  }
}
