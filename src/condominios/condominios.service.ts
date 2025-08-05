import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common'
import { Model, Types } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { Admin, AdminDocument } from '@/admins/admin.schemas'
import {
  CreateCondominioDto,
  UpdateCondominioInfoDto,
  UpdateCondominioStatusDto,
} from './dto/condominio.dto'
import { Condominio, CondominioDocument } from './condominio.schema'
import { DepartamentosService } from '@/departamentos/departamentos.service'
import { Departamento } from '@/departamentos/departamento.schema'
import { CreateDepartamentoDto } from '@/departamentos/dto/departamento.dto'

@Injectable()
export class CondominiosService {
  constructor(
    @InjectModel(Condominio.name)
    private readonly condominioModel: Model<CondominioDocument>,
    @InjectModel(Admin.name)
    private readonly adminModel: Model<AdminDocument>,
    private readonly departamentosService: DepartamentosService,
  ) {}

  async create(dto: CreateCondominioDto): Promise<Condominio> {
    // Validar existencia condominio ID
    const exists = await this.condominioModel.findOne({ id: dto.id }).exec()
    if (exists)
      throw new ConflictException('Ya existe un condominio con ese ID')

    // Validar admin
    const admin = await this.adminModel.findById(dto.adminId).exec()
    if (!admin) throw new NotFoundException('Admin no encontrado')

    // Crear condominio sin departamentos todavía
    const condominioData: Partial<Condominio> = {
      id: dto.id,
      name: dto.name,
      address: dto.address,
      email: dto.email,
      phone: dto.phone,
      tipo: dto.tipo,
      adminId: admin._id,
      status: 'active',
      areasComunes: dto.areasComunes,
    }

    const createdCondominio = new this.condominioModel(condominioData)
    const savedCondominio = await createdCondominio.save()

    const departamentosIds: Types.ObjectId[] = []

    if (dto.tipo === 'torres') {
      if (!dto.torres || dto.torres.length === 0) {
        throw new ConflictException(
          'Debe especificar al menos una torre con departamentos',
        )
      }

      for (const torre of dto.torres) {
        for (let i = 1; i <= torre.departamentos; i++) {
          const codigo = `${torre.identificador.toUpperCase()}${String(i).padStart(2, '0')}`
          const nombre = `Departamento ${codigo}`

          const departamentoDto: CreateDepartamentoDto = {
            codigo,
            nombre,
            estado: 'disponible',
            condominio: savedCondominio._id,
            grupo: torre.identificador.toUpperCase(),
            propietario: undefined,
          }

          const departamento =
            await this.departamentosService.create(departamentoDto)
          departamentosIds.push(departamento._id)
        }
      }
    } else if (dto.tipo === 'casas') {
      if (!dto.casas || dto.casas.length === 0) {
        throw new ConflictException(
          'Debe especificar al menos un identificador de casas con cantidad',
        )
      }

      for (const casa of dto.casas) {
        for (let i = 1; i <= casa.cantidad; i++) {
          const codigo = `${casa.identificador.toUpperCase()}${String(i).padStart(2, '0')}`
          const nombre = `Casa ${codigo}`

          const departamentoDto: CreateDepartamentoDto = {
            codigo,
            nombre,
            estado: 'disponible',
            condominio: savedCondominio._id,
            grupo: casa.identificador.toUpperCase(),
            propietario: undefined,
          }

          const departamento =
            await this.departamentosService.create(departamentoDto)
          departamentosIds.push(departamento._id)
        }
      }
    }

    // Guardar departamentos vinculados al condominio
    savedCondominio.departamentos = departamentosIds
    await savedCondominio.save()

    // Actualizar admin con el condominio
    await this.adminModel.findByIdAndUpdate(admin._id, {
      $push: { condominios: savedCondominio._id },
    })

    return savedCondominio
  }

  async findAll(condominioId?: string): Promise<CondominioDocument[]> {
    const filter: any = {}
    if (condominioId) {
      filter._id = condominioId
    }

    return this.condominioModel
      .find(filter)
      .populate('adminId', 'name email phone identification')
      .sort({ createdAt: -1 })
      .exec()
  }

  async findOneById(id: string): Promise<CondominioDocument> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('ID inválido')
    const condominio = await this.condominioModel
      .findById(id)
      .populate('adminId', 'name email phone identification')
      .exec()
    if (!condominio) throw new NotFoundException('Condominio no encontrado')
    return condominio
  }

  async updateStatus(
    id: string,
    dto: UpdateCondominioStatusDto,
  ): Promise<CondominioDocument> {
    const condominio = await this.findOneById(id)
    condominio.status = dto.status
    return condominio.save()
  }

  async updateInfo(
    id: string,
    dto: UpdateCondominioInfoDto,
  ): Promise<CondominioDocument> {
    const condominio = await this.findOneById(id)

    if (dto.name) condominio.name = dto.name
    if (dto.address) condominio.address = dto.address
    if (dto.email) condominio.email = dto.email
    if (dto.phone) condominio.phone = dto.phone

    if (dto.areasComunes) {
      condominio.areasComunes = dto.areasComunes.map((area) => ({
        nombre: area.nombre,
        estado: area.estado ?? 'libre',
        descripcion: area.descripcion,
        capacidad: area.capacidad,
      }))
    }

    const nuevosDepartamentos: Types.ObjectId[] = []

    if (dto.torres && dto.torres.length > 0) {
      for (const torre of dto.torres) {
        for (let i = 1; i <= torre.departamentos; i++) {
          const codigo = `${torre.identificador.toUpperCase()}${String(i).padStart(2, '0')}`
          const nombre = `Departamento ${codigo}`

          const departamentoDto: CreateDepartamentoDto = {
            codigo,
            nombre,
            estado: 'disponible',
            condominio: condominio._id,
            grupo: torre.identificador.toUpperCase(),
            propietario: undefined,
          }

          const departamento =
            await this.departamentosService.create(departamentoDto)
          nuevosDepartamentos.push(departamento._id)
        }
      }
    }

    if (dto.casas && dto.casas.length > 0) {
      for (const casa of dto.casas) {
        for (let i = 1; i <= casa.cantidad; i++) {
          const codigo = `${casa.identificador.toUpperCase()}${String(i).padStart(2, '0')}`
          const nombre = `Casa ${codigo}`

          const departamentoDto: CreateDepartamentoDto = {
            codigo,
            nombre,
            estado: 'disponible',
            condominio: condominio._id,
            grupo: casa.identificador.toUpperCase(),
            propietario: undefined,
          }

          const departamento =
            await this.departamentosService.create(departamentoDto)
          nuevosDepartamentos.push(departamento._id)
        }
      }
    }

    if (nuevosDepartamentos.length > 0) {
      condominio.departamentos.push(...nuevosDepartamentos)
    }

    return condominio.save()
  }
}
