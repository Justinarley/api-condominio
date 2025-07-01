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

@Injectable()
export class CondominiosService {
  constructor(
    @InjectModel(Condominio.name)
    private readonly condominioModel: Model<CondominioDocument>,
    @InjectModel(Admin.name)
    private readonly adminModel: Model<AdminDocument>,
  ) {}

  async create(dto: CreateCondominioDto): Promise<Condominio> {
    // Verificar si ya existe un condominio con ese ID personalizado
    const exists = await this.condominioModel.findOne({ id: dto.id }).exec()
    if (exists) {
      throw new ConflictException('Ya existe un condominio con ese ID')
    }

    // Verificar si el admin existe
    const admin = await this.adminModel.findById(dto.adminId).exec()
    if (!admin) {
      throw new NotFoundException('Admin no encontrado')
    }

    // Crear condominio
    const created = new this.condominioModel({
      ...dto,
      adminId: admin._id,
    })

    const saved = await created.save()

    // Actualiza el admin para incluir este condominio en su lista
    await this.adminModel.findByIdAndUpdate(admin._id, {
      $push: { condominios: saved._id },
    })

    return saved
  }

  async findAll(): Promise<CondominioDocument[]> {
    return this.condominioModel
      .find()
      .populate('adminId', 'name email phone identification')
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
    return condominio.save()
  }
}
